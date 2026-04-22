import { getMongoDb } from '@/infra/mongodb/client'
import type { SprintMetricsDocument } from '@/modules/metrics/types'
import { SPRINT_METRICS_COLLECTION } from '@/modules/metrics/repository'
import type { SprintSnapshotDocument } from './models'
import { SPRINT_SNAPSHOTS_COLLECTION } from './repository'
import type { SprintOverviewEntry } from './overview-list'

export const SPRINT_LIST_DEFAULT_LIMIT = 20
export const SPRINT_LIST_MAX_LIMIT = 50
export const SPRINT_CHART_MAX_POINTS = 60

/** Filtros de tempo e ID (aplicados no backend). */
export type SprintListFilters = {
  syncedAfter?: Date
  syncedBefore?: Date
  /** Correspondência parcial, case-insensitive, sobre o campo `sprintId`. */
  sprintIdContains?: string
}

export type SprintListPagination = {
  page: number
  limit: number
}

export type ParsedSprintListQuery = SprintListFilters &
  SprintListPagination & {
    /** Incluir série para gráficos (cronológica, limitada). */
    includeChartSeries: boolean
  }

export function toSprintListFilters(parsed: ParsedSprintListQuery): SprintListFilters {
  return {
    syncedAfter: parsed.syncedAfter,
    syncedBefore: parsed.syncedBefore,
    sprintIdContains: parsed.sprintIdContains,
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Match MongoDB sobre `sprint_snapshots` (testável). */
export function buildSnapshotMatch(filters: SprintListFilters): Record<string, unknown> {
  const m: Record<string, unknown> = {}

  if (filters.syncedAfter || filters.syncedBefore) {
    const range: Record<string, string> = {}
    if (filters.syncedAfter) {
      range.$gte = filters.syncedAfter.toISOString()
    }
    if (filters.syncedBefore) {
      range.$lte = filters.syncedBefore.toISOString()
    }
    m.syncedAt = range
  }

  if (filters.sprintIdContains) {
    const q = filters.sprintIdContains.trim()
    if (q.length > 0) {
      m.sprintId = { $regex: escapeRegex(q), $options: 'i' }
    }
  }

  return m
}

export function parseSprintListQuery(sp: URLSearchParams): ParsedSprintListQuery {
  const pageRaw = sp.get('page')
  const limitRaw = sp.get('limit')
  let page = Math.max(1, Number.parseInt(pageRaw || '1', 10) || 1)
  if (!Number.isFinite(page)) {
    page = 1
  }

  let limit = Number.parseInt(limitRaw || String(SPRINT_LIST_DEFAULT_LIMIT), 10) || SPRINT_LIST_DEFAULT_LIMIT
  limit = Math.min(SPRINT_LIST_MAX_LIMIT, Math.max(1, limit))

  let syncedAfter: Date | undefined
  let syncedBefore: Date | undefined

  const syncedAfterParam = sp.get('syncedAfter')
  if (syncedAfterParam) {
    const t = Date.parse(syncedAfterParam)
    if (!Number.isNaN(t)) {
      syncedAfter = new Date(t)
    }
  }

  const syncedBeforeParam = sp.get('syncedBefore')
  if (syncedBeforeParam) {
    const t = Date.parse(syncedBeforeParam)
    if (!Number.isNaN(t)) {
      syncedBefore = new Date(t)
    }
  }

  const daysRaw = sp.get('days')
  if (syncedAfter === undefined && daysRaw !== null && daysRaw !== '') {
    const days = Math.min(365 * 5, Math.max(1, Number.parseInt(daysRaw, 10) || 0))
    if (days > 0) {
      const d = new Date()
      d.setTime(d.getTime() - days * 86_400_000)
      syncedAfter = d
    }
  }

  const sprintIdContains = sp.get('sprintId')?.trim() || undefined

  const includeChartSeries =
    sp.get('includeChartSeries') === '1' || sp.get('includeChartSeries') === 'true'

  return {
    page,
    limit,
    syncedAfter,
    syncedBefore,
    sprintIdContains,
    includeChartSeries,
  }
}

function mapDocToEntry(doc: {
  sprintId: string
  sprintName: string
  boardId: string | null
  syncedAt: string
  extractionStatus: string
  metrics?: SprintMetricsDocument | null
}): SprintOverviewEntry {
  return {
    sprintId: doc.sprintId,
    sprintName: doc.sprintName,
    boardId: doc.boardId,
    syncedAt: doc.syncedAt,
    extractionStatus: doc.extractionStatus,
    metrics: doc.metrics ?? null,
  }
}

const lookupMetricsStages = [
  {
    $lookup: {
      from: SPRINT_METRICS_COLLECTION,
      localField: 'sprintId',
      foreignField: 'sprintId',
      as: 'm',
    },
  },
  {
    $addFields: {
      metrics: { $arrayElemAt: ['$m', 0] },
    },
  },
  { $project: { m: 0 } },
]

/**
 * Lista paginada de sprints + contagem total. Opcionalmente devolve série cronológica para gráficos.
 */
export async function listSprintsPaginated(
  parsed: ParsedSprintListQuery,
): Promise<{
  items: SprintOverviewEntry[]
  total: number
  page: number
  limit: number
  chartSeries: SprintOverviewEntry[] | null
}> {
  const db = await getMongoDb()
  const match = buildSnapshotMatch(parsed)
  const skip = (parsed.page - 1) * parsed.limit

  const facet: Record<string, object[]> = {
    totalCount: [{ $count: 'n' }],
    pageItems: [
      { $skip: skip },
      { $limit: parsed.limit },
      ...lookupMetricsStages,
    ],
  }

  if (parsed.includeChartSeries) {
    facet.chartSeries = [
      { $sort: { syncedAt: 1 } },
      { $limit: SPRINT_CHART_MAX_POINTS },
      ...lookupMetricsStages,
    ]
  }

  const pipeline = [{ $match: match }, { $sort: { syncedAt: -1 } }, { $facet: facet }]

  const [row] = await db
    .collection<SprintSnapshotDocument>(SPRINT_SNAPSHOTS_COLLECTION)
    .aggregate<{
      totalCount: { n: number }[]
      pageItems: Array<
        SprintSnapshotDocument & { metrics?: SprintMetricsDocument | null }
      >
      chartSeries?: Array<SprintSnapshotDocument & { metrics?: SprintMetricsDocument | null }>
    }>(pipeline)
    .toArray()

  const total = row?.totalCount?.[0]?.n ?? 0
  const rawItems = row?.pageItems ?? []
  const items = rawItems.map((d) =>
    mapDocToEntry({
      sprintId: d.sprintId,
      sprintName: d.sprintName,
      boardId: d.boardId,
      syncedAt: d.syncedAt,
      extractionStatus: d.extractionStatus,
      metrics: d.metrics ?? null,
    }),
  )

  let chartSeries: SprintOverviewEntry[] | null = null
  if (parsed.includeChartSeries && row?.chartSeries) {
    chartSeries = row.chartSeries.map((d) =>
      mapDocToEntry({
        sprintId: d.sprintId,
        sprintName: d.sprintName,
        boardId: d.boardId,
        syncedAt: d.syncedAt,
        extractionStatus: d.extractionStatus,
        metrics: d.metrics ?? null,
      }),
    )
  }

  return { items, total, page: parsed.page, limit: parsed.limit, chartSeries }
}
