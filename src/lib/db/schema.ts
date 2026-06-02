import Dexie, { type Table } from 'dexie'
import type { Trip } from '@/types'

export class TravelDB extends Dexie {
  trips!: Table<Trip>

  constructor() {
    super('travel-app')
    this.version(1).stores({
      trips: 'id, status, startDate, endDate, destination',
    })
  }
}

export const db = new TravelDB()
