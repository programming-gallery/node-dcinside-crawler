# dcinside-crawler
typescript dcinside crawler

## Installation 
```sh
npm install dcinside-crawler --save
yarn add dcinside-crawler
bower install dcinside-crawler --save
```
## Usage

```typescript
import Crawler from 'dcinside-crawler';
const gallery = {
  id: 'programming',
  isMinser: false,
};
/* Fetch 101 number of documents from frist page */
let documentHeaders = await Crawler.documentHeaders({ gallery, page=1, limit=101 });
documentHeaders.length === 101 // true

/* Fetch all new published documents from the last document */
let newPublishedDocumentHeaders = await Crawler.documentHeaders({ gallery, lastDocumentId: documentHeaders[0].id })

documentHeaders[0];
/* 
 * DocumentHeader {
 *  gallery: { id: 'programming', isMinser: false },
 *  id: 10002,
 *  title: '좆목현장 검거.jpg',
 *  author: { nickname: 'ㅇㅇ',  ip: '10.20', },
 *  createdAt: new Date('2020-01-01T00:00:00Z'),
 *  commentCount: 0,
 *  likeCount: 0,
 *  hasImage: false;
 *  hasVideo: false;
 *  isRecommend: false;
 * }
 */

/* Fetch all comments of document */
let comments = await Crawler.comments({ document: documentHeaders[0] })

/* Fetch all new published comments from the last comment */
let newPublishedComments = await Crawler.comments({ document: documentHeaders[0], lastCommentId: comments[0].id })

comments[0];
/* 
 * Comment {
 *  id: 219021,
 *  author: { nickname: '초코냥',  id: 'abcde', },
 *  parent?: Comment,
 *  createdAt: new Date('2020-01-01T00:00:00Z'),
 *  document: { gallery: {id: 'programming', isMinser: false}, id: 10002 },
 *  createdAt: new Date('2020-01-01T00:00:00Z'),
 *  voiceCopyId?: undefined,
 *  contents?: undefined,
 *  dccon?: Dccon{ 
 *    dcconName: '1';
 *    dcconPackageId: 'aspfhj3h98h9haos';
 *    imageUrl: 'https://img.dcinside.com/...',
 *  },
 * }
 */
```

## Test 
```sh
npm run test
```
