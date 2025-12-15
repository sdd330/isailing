import type { ThemeConfig } from '@/config/theme.config'
import type { Location as LocationData } from '@/types/game'
import { Location, LocationType } from './Location'

export class City {
  private locations: Location[] = []

  constructor(
    public readonly name: string,
    public readonly shortName: string,
    public readonly theme: ThemeConfig,
    private visitsThisWeek: string[] = []
  ) {
    this.initializeLocations()
  }

  private initializeLocations(): void {
    this.locations = this.theme.city.locations.map((loc) => {
      let type = LocationType.UNKNOWN
      
      if (loc.description.includes('交通枢纽') || loc.name.includes('站') || loc.name.includes('机场')) {
        type = LocationType.TRANSPORTATION_HUB
      } else if (loc.description.includes('商业') || loc.description.includes('商业区')) {
        type = LocationType.COMMERCIAL_AREA
      } else if (loc.description.includes('居民') || loc.description.includes('居民区')) {
        type = LocationType.RESIDENTIAL_AREA
      } else if (loc.description.includes('文化') || loc.description.includes('教育')) {
        type = LocationType.CULTURAL_AREA
      } else if (loc.description.includes('金融') || loc.description.includes('商务')) {
        type = LocationType.BUSINESS_DISTRICT
      }
      
      return Location.fromData(loc, type)
    })
  }

  addVisit(): void {
    if (!this.visitsThisWeek.includes(this.name)) {
      this.visitsThisWeek.push(this.name)
    }
  }

  hasVisited(): boolean {
    return this.visitsThisWeek.includes(this.name)
  }

  getVisitsCount(): number {
    return this.visitsThisWeek.filter(city => city === this.name).length
  }

  resetVisits(): void {
    this.visitsThisWeek = this.visitsThisWeek.filter(city => city !== this.name)
  }

  getLocations(): Location[] {
    return this.locations
  }

  getLocationById(id: number): Location | undefined {
    return this.locations.find(loc => loc.id === id)
  }

  getLocationData(): LocationData[] {
    return this.theme.city.locations
  }

  getTransportationHubs(): Location[] {
    return this.locations.filter(loc => loc.isTransportationHub())
  }

  getCurrentLocation(): Location | undefined {
    return this.locations[0]
  }

  getGoods(): typeof this.theme.goods {
    return this.theme.goods
  }

  getBuildings(): typeof this.theme.buildings {
    return this.theme.buildings
  }

  getEvents(): typeof this.theme.events {
    return this.theme.events
  }

  canVisit(maxVisits: number): boolean {
    const uniqueVisits = new Set(this.visitsThisWeek)
    return uniqueVisits.size < maxVisits || this.hasVisited()
  }
}
