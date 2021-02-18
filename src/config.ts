/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { API_KEYS } from './api_key.js';


const config = {
  ticketMasterBaseURL:
    `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEYS.ticketMasterKEY}&keyword=`,
  audiodbArtistBaseURL: `https://theaudiodb.com/api/v1/json/${API_KEYS.audioDBKEY}/search.php?s=`,
  audiodbAlbumsBaseURL:
    `https://theaudiodb.com/api/v1/json/${API_KEYS.audioDBKEY}/searchalbum.php?s=`,
};

export default config;
