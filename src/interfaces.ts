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
  dates: any;
  name: string;
  url: string;
  _embedded: any;
  images: any;
}

const mmg = 'mmg';

// need to declare types for this properties
