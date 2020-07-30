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
    document: DocumentIndex;
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
    gallery: GalleryIndex;
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
export declare type DocumentIndex = Pick<DocumentHeader, 'id' | 'gallery'> & Partial<DocumentHeader>;
/**
 * Minimum Gallery information to fetch related data from dcinside
 */
export declare type GalleryIndex = Pick<Gallery, 'id' | 'isMiner'> & Partial<Gallery>;
declare class RawCrawler {
    e_s_n_o: string;
    request: any;
    constructor(rps?: number, retries?: number);
    weeklyActiveMajorGalleryIndexes(): Promise<GalleryIndex[]>;
    weeklyActiveMinorGalleryIndexes(): Promise<GalleryIndex[]>;
    realtimeActiveMinorGalleryIndexes(): Promise<GalleryIndex[]>;
    realtimeActiveMajorGalleryIndexes(): Promise<GalleryIndex[]>;
    documentHeaders(gallery: GalleryIndex, page: number): Promise<DocumentHeader[]>;
    comments(doc: DocumentIndex, page?: number): Promise<{
        comments: Comment[];
        pageCount: number;
    }>;
}
export interface CrawlerDocumentHeaderOptions {
    gallery: GalleryIndex;
    lastDocumentId?: number;
    lastDocumentCreatedAt?: Date;
    page?: number;
    limit?: number;
}
export interface CrawlerCommentsOptions {
    document: DocumentIndex;
    lastCommentId?: number;
}
export default class Crawler {
    rawCrawler: RawCrawler;
    constructor(rps?: number, retries?: number);
    documentHeaders(options: CrawlerDocumentHeaderOptions): Promise<DocumentHeader[]>;
    comments(options: CrawlerCommentsOptions): Promise<Comment[]>;
    activeGalleryIndexes(): Promise<GalleryIndex[]>;
}
export {};
