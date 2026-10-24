import offoraReel from '../assets/reels/DZ96-7xzaEK_reel.mp4'
import asifeReel from '../assets/reels/Asife.mp4'
import asifeReel2 from '../assets/reels/Asife-2.mp4'
import beetzoReel from '../assets/reels/Beetzo.mp4'
import bts1 from '../assets/reels/BTS-1.mp4'
import bts2 from '../assets/reels/BTS-2.mp4'
import bts3 from '../assets/reels/BTS-3.mp4'
import bts4 from '../assets/reels/BTS-4.mp4'
import bts5 from '../assets/reels/DWGEitxkagx_reel.mp4'

import offoraPoster from '../assets/reels/thumbnails/Offora.jpg'
import asifePoster from '../assets/reels/thumbnails/Asife.jpg'
import asifePoster2 from '../assets/reels/thumbnails/Asife-2.jpg'
import beetzoPoster from '../assets/reels/thumbnails/Beetzo.jpg'
import bts1Poster from '../assets/reels/thumbnails/BTS-1.jpg'
import bts2Poster from '../assets/reels/thumbnails/BTS-2.jpg'
import bts3Poster from '../assets/reels/thumbnails/BTS-3.jpg'
import bts4Poster from '../assets/reels/thumbnails/BTS-4.jpg'
import bts5Poster from '../assets/reels/thumbnails/BTS-5.jpg'

export const galleryCategories = [
  {
    id: 'reels',
    label: 'Instagram Reels',
    items: [
      { id: 'reel-offora', title: 'Offora Tech - Reel', video: offoraReel, poster: offoraPoster },
      { id: 'reel-asife', title: 'Aasife Biriyani - Reel', video: asifeReel, poster: asifePoster },
      { id: 'reel-asife-2', title: 'Aasife Biriyani - Reel 2', video: asifeReel2, poster: asifePoster2 },
      { id: 'reel-beetzo', title: 'Beetzo - Reel', video: beetzoReel, poster: beetzoPoster },
    ],
  },
  {
    id: 'video-edit',
    label: 'Video Edit Works',
    items: [
      { id: 'edit-offora', title: 'Offora Tech - Director’s Cut', video: offoraReel, poster: offoraPoster },
      { id: 'edit-asife', title: 'Aasife Biriyani - Highlight Edit', video: asifeReel, poster: asifePoster },
      { id: 'edit-beetzo', title: 'Beetzo - Campaign Edit', video: beetzoReel, poster: beetzoPoster },
      { id: 'edit-bts-1', title: 'Shoot Day - Edit Cut', video: bts1, poster: bts1Poster },
      { id: 'edit-bts-2', title: 'Strategy Session - Edit Cut', video: bts2, poster: bts2Poster },
      { id: 'edit-bts-3', title: 'Client Walkthrough - Edit Cut', video: bts3, poster: bts3Poster },
      { id: 'edit-bts-4', title: 'Studio Setup - Edit Cut', video: bts4, poster: bts4Poster },
      { id: 'edit-bts-5', title: 'Team at Work - Edit Cut', video: bts5, poster: bts5Poster },
    ],
  },
  {
    id: 'bts',
    label: 'Behind the Scenes',
    items: [
      { id: 'bts-1', title: 'On Set - Video Shoot Day', video: bts1, poster: bts1Poster },
      { id: 'bts-2', title: 'Strategy Session', video: bts2, poster: bts2Poster },
      { id: 'bts-3', title: 'Client Walkthrough', video: bts3, poster: bts3Poster },
      { id: 'bts-4', title: 'Studio Setup', video: bts4, poster: bts4Poster },
      { id: 'bts-5', title: 'Team at Work', video: bts5, poster: bts5Poster },
    ],
  },
]
