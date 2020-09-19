export interface Artist {
  strBiographyEN: string;
  strArtistThumb: string;
  strArtist: string;
  strCountry: string;
  strStyle: string;
  strTwitter: string;
  strWebsite: string;
}

export interface Albums {
  strAlbumThumb: string;
  strArtist: string;
  strAlbumStripped: string;
  intYearReleased: number;
}

export interface AllEvents {
  events: Events[];
}

export interface Events {
  dates: Dates;
  name: string;
  url: string;
  _embedded: Embedded;
  images: Images[];
}

export interface Dates {
  start: StartDate;
  status: statusDate;
}
type StartDate = {
  localDate: string;
};
type statusDate = {
  code: string;
};

export type Images = {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
};

export interface Embedded {
  attractions: [];
  venues: Venues[];
}
type Venues = {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  country: Country;
  city: City;
};

type Country = {
  name: string;
  countryCode: string;
};

type City = {
  name: string;
};
// need to declare types for this properties
