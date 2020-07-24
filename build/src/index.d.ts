export interface User {
  nickname: string;
}
/**
 * 고닉
 */
export interface StaticUser extends User {
  id: string;
}
/**
 * 유동
 */
export interface DynamicUser extends User {
  ip: string;
}
export interface Comment {
  id: number;
  author: User;
  parent?: Comment | null;
  createdAt: Date;
  document: ThinDocument;
}
export interface TextComment extends Comment {
  contents: string;
}
export interface VoiceComment extends Comment {
  voiceCopyId: string;
}
export interface Dccon {
  imageUrl: string;
  name: string;
  packageId: string;
}
export interface DcconComment extends Comment {
  dccon: Dccon;
}
/**
 * Document header fetched from gallery board
 */
export interface DocumentHeader {
  gallery: ThinGallery;
  id: number;
  title: string;
  author: User;
  commentCount: number;
  likeCount: number;
  hasImage: boolean;
  hasVideo: boolean;
  isRecommend: boolean;
  createdAt: Date;
}
export interface Gallery {
  /**
   * Gallery id, represented as URL like `https://gall.dcinside.com/board/view/?id=*THIS_VALUE*`
   */
  id: string;
  /**
   * True if this is a miner gallery
   */
  isMiner: boolean;
  /**
   * Name of the gallery
   */
  name: string;
  /**
   * A manager user of this gallery
   */
  manager: StaticUser;
  /**
   * SubManager users of this gallery
   */
  subManagers: StaticUser[];
}
/**
 * Minimum Document information to fetch related data from dcinside
 */
export declare type ThinDocument = Pick<DocumentHeader, 'id' | 'gallery'> &
  Partial<DocumentHeader>;
/**
 * Minimum Gallery information to fetch related data from dcinside
 */
export declare type ThinGallery = Pick<Gallery, 'id' | 'isMiner'> &
  Partial<Gallery>;
declare class RawCrawler {
  e_s_n_o: string;
  documentHeaders(
    gallery: ThinGallery,
    page: number
  ): Promise<DocumentHeader[]>;
  comments(
    doc: ThinDocument,
    page?: number
  ): Promise<{
    comments: Comment[];
    pageCount: number;
  }>;
}
export interface CrawlerDocumentHeaderOptions {
  gallery: ThinGallery;
  lastDocumentId?: number;
  page?: number;
  limit?: number;
}
export interface CrawlerCommentsOptions {
  document: ThinDocument;
  lastCommentId?: number;
}
export default class Crawler {
  rawCrawler: RawCrawler;
  documentHeaders(
    _options: CrawlerDocumentHeaderOptions
  ): Promise<DocumentHeader[]>;
  comments(options: CrawlerCommentsOptions): Promise<Comment[]>;
}
export {};
