import { CourseData } from '../types';

export const courseData: CourseData = {
  id: 'sore-sacks-and-six-packs-nX4x',
  name: 'Sore Sacks & Six Packs',
  location: 'Fort Wayne, Indiana',
  propertyCoordinates: {
    lat: 41.16715,
    lng: -85.21105
  },
  totalPar: 28,
  totalDistanceFt: 2145,
  holeCount: 9,
  basketCount: 3,
  baskets: [
    {
      basketNumber: 1,
      id: 'pin_u2tv8ywn608pw897zoyqfyrw',
      name: 'Basket 1 (North-West)',
      color: '#10b981', // Green
      model: 'Axiom Lite (Green)',
      lat: 41.1675289,
      lng: -85.2114291,
      servesHoles: [1, 4, 8]
    },
    {
      basketNumber: 2,
      id: 'pin_wjfh6yjqqx6s294ldhw0ymvs',
      name: 'Basket 2 (North-East)',
      color: '#3b82f6', // Blue/Green
      model: 'Axiom Lite (Green)',
      lat: 41.1674351,
      lng: -85.2106797,
      servesHoles: [2, 5, 7]
    },
    {
      basketNumber: 3,
      id: 'pin_flft9iwp0qv9zpj35wy101k7',
      name: 'Basket 3 (South-East)',
      color: '#f59e0b', // Amber/Green
      model: 'Axiom Lite (Green)',
      lat: 41.1669462,
      lng: -85.2106534,
      servesHoles: [3, 6, 9]
    }
  ],
  holes: [
    {
      number: 1,
      name: 'Hole 1',
      par: 3,
      distanceFt: 272,
      distanceM: 83,
      tee: {
        id: 'tee_k0zozrtkbxr168gcxn6pwcwk',
        name: 'Tee 1',
        lat: 41.166789,
        lng: -85.2115032
      },
      basket: {
        id: 'pin_u2tv8ywn608pw897zoyqfyrw',
        basketNumber: 1,
        name: 'Basket 1',
        lat: 41.1675289,
        lng: -85.2114291,
        color: '#10b981'
      },
      doglegs: [
        {
          lat: 41.167118565204646,
          lng: -85.21141452499806
        }
      ],
      notes: 'Dogleg fairway along the western edge toward Basket 1.',
      isSafari: false
    },
    {
      number: 2,
      name: 'Hole 2',
      par: 3,
      distanceFt: 226,
      distanceM: 69,
      tee: {
        id: 'tee_my53wa2wsynmmgvn6x1ty9hs',
        name: 'Tee 2',
        lat: 41.1674108,
        lng: -85.2115049
      },
      basket: {
        id: 'pin_wjfh6yjqqx6s294ldhw0ymvs',
        basketNumber: 2,
        name: 'Basket 2',
        lat: 41.1674351,
        lng: -85.2106797,
        color: '#3b82f6'
      },
      doglegs: [],
      notes: 'Clean line east across the northern boundary to Basket 2.',
      isSafari: false
    },
    {
      number: 3,
      name: 'Hole 3',
      par: 3,
      distanceFt: 161,
      distanceM: 49,
      tee: {
        id: 'tee_n1eofkhbpgffphe94s8kgz0n',
        name: 'Tee 3',
        lat: 41.1673541,
        lng: -85.2106415
      },
      basket: {
        id: 'pin_flft9iwp0qv9zpj35wy101k7',
        basketNumber: 3,
        name: 'Basket 3',
        lat: 41.1669462,
        lng: -85.2106534,
        color: '#f59e0b'
      },
      doglegs: [
        {
          lat: 41.16704093952572,
          lng: -85.21074338541152
        }
      ],
      notes: 'Short technical approach south to Basket 3 with slight shape.',
      isSafari: false
    },
    {
      number: 4,
      name: 'Hole 4',
      par: 3,
      distanceFt: 272,
      distanceM: 83,
      tee: {
        id: 'tee_um13mol0abklwhgs3i5of5c2',
        name: 'Tee 4',
        lat: 41.1669723,
        lng: -85.2107655
      },
      basket: {
        id: 'pin_u2tv8ywn608pw897zoyqfyrw',
        basketNumber: 1,
        name: 'Basket 1',
        lat: 41.1675289,
        lng: -85.2114291,
        color: '#10b981'
      },
      doglegs: [],
      notes: 'Long push diagonally northwest across property back to Basket 1.',
      isSafari: false
    },
    {
      number: 5,
      name: 'Hole 5',
      par: 3,
      distanceFt: 266,
      distanceM: 81,
      tee: {
        id: 'tee_pt2ud9lf0zpvvpqnx8phmldh',
        name: 'Tee 5',
        lat: 41.1670665,
        lng: -85.2115156
      },
      basket: {
        id: 'pin_wjfh6yjqqx6s294ldhw0ymvs',
        basketNumber: 2,
        name: 'Basket 2',
        lat: 41.1674351,
        lng: -85.2106797,
        color: '#3b82f6'
      },
      doglegs: [],
      notes: 'Power throw northeast cutting across to Basket 2.',
      isSafari: false
    },
    {
      number: 6,
      name: 'Hole 6',
      par: 3,
      distanceFt: 262,
      distanceM: 80,
      tee: {
        id: 'tee_tzjbyrxrvr5z2zj22vpo43lx',
        name: 'Tee 6',
        lat: 41.1675155,
        lng: -85.2112424
      },
      basket: {
        id: 'pin_flft9iwp0qv9zpj35wy101k7',
        basketNumber: 3,
        name: 'Basket 3',
        lat: 41.1669462,
        lng: -85.2106534,
        color: '#f59e0b'
      },
      doglegs: [],
      notes: 'Fairway heading southeast toward Basket 3.',
      isSafari: false
    },
    {
      number: 7,
      name: 'Hole 7',
      par: 3,
      distanceFt: 170,
      distanceM: 52,
      tee: {
        id: 'tee_um13mol0abklwhgs3i5of5c2',
        name: 'Tee 7',
        lat: 41.1669723,
        lng: -85.2107655
      },
      basket: {
        id: 'pin_wjfh6yjqqx6s294ldhw0ymvs',
        basketNumber: 2,
        name: 'Basket 2',
        lat: 41.1674351,
        lng: -85.2106797,
        color: '#3b82f6'
      },
      doglegs: [],
      notes: 'Safari Loop: Tight line north to Basket 2.',
      isSafari: true
    },
    {
      number: 8,
      name: 'Hole 8',
      par: 3,
      distanceFt: 226,
      distanceM: 69,
      tee: {
        id: 'tee_n1eofkhbpgffphe94s8kgz0n',
        name: 'Tee 8',
        lat: 41.1673541,
        lng: -85.2106415
      },
      basket: {
        id: 'pin_u2tv8ywn608pw897zoyqfyrw',
        basketNumber: 1,
        name: 'Basket 1',
        lat: 41.1675289,
        lng: -85.2114291,
        color: '#10b981'
      },
      doglegs: [],
      notes: 'Safari Loop: Clean drive west straight across to Basket 1.',
      isSafari: true
    },
    {
      number: 9,
      name: 'Hole 9',
      par: 4,
      distanceFt: 289,
      distanceM: 88,
      tee: {
        id: 'tee_my53wa2wsynmmgvn6x1ty9hs',
        name: 'Tee 9',
        lat: 41.1674108,
        lng: -85.2115049
      },
      basket: {
        id: 'pin_flft9iwp0qv9zpj35wy101k7',
        basketNumber: 3,
        name: 'Basket 3',
        lat: 41.1669462,
        lng: -85.2106534,
        color: '#f59e0b'
      },
      doglegs: [],
      notes: 'The Signature Finale! Par 4 diagonal flight across the entire layout to Basket 3.',
      isSafari: true
    }
  ],
  rules: {
    access: 'Private Course - Registered Guests & Crew Only',
    byob: true,
    caddieNotes: [
      'Don\'t Be a Loser, DRINK BEER!!',
      'Swift Kick in the Ass to start the round!',
      'SJBR per round required!',
      'Respect the neighbors and private property lines at all times.'
    ],
    history: 'The Honorable Chris Wilson has been so kind as to contribute the baskets for this dream!'
  }
};
