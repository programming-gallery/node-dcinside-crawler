export interface User {
    id?: string;
    nickname: string;
    ip?: string;
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
    subject: string | undefined;
    author: User;
    commentCount: number;
    likeCount: number;
    viewCount: number;
    hasImage: boolean;
    hasVideo: boolean;
    isRecommend: boolean;
    createdAt: Date;
}
export interface Document extends DocumentHeader {
    contents: string;
    isMobile: boolean;
    staticLikeCount: number;
    subject: string | undefined;
    comments: Comment[];
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
    manager: User;
    /**
     * SubManager users of this gallery
     */
    subManagers: User[];
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
    host: string;
    e_s_n_o: string;
    request: any;
    constructor(rps?: number, retries?: number, host?: string);
    weeklyActiveMajorGalleryIndexes(): Promise<GalleryIndex[]>;
    weeklyActiveMinorGalleryIndexes(): Promise<GalleryIndex[]>;
    realtimeActiveMinorGalleryIndexes(): Promise<GalleryIndex[]>;
    realtimeActiveMajorGalleryIndexes(): Promise<GalleryIndex[]>;
    documentHeaders(gallery: GalleryIndex, page: number): Promise<DocumentHeader[]>;
    document(index: DocumentIndex): Promise<Document>;
    comments(document: DocumentIndex): Promise<Comment[]>;
    _comments(doc: DocumentIndex, page?: number): Promise<{
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
export declare class Crawler {
    rawCrawler: RawCrawler;
    constructor(rps?: number, retries?: number, host?: string);
    documentHeaders(options: CrawlerDocumentHeaderOptions): Promise<DocumentHeader[]>;
    document(index: DocumentIndex): Promise<Document>;
    documentHeaderWithCommentAsyncIterator(options: CrawlerDocumentHeaderOptions): AsyncGenerator<DocumentHeader & {
        comments: Comment[];
    }>;
    robustDocumentAsyncIterator(options: CrawlerDocumentHeaderOptions): AsyncGenerator<{
        success: boolean;
        result?: Document;
        error?: any;
    }>;
    comments(index: DocumentIndex): Promise<Comment[]>;
    activeGalleryIndexes(): Promise<GalleryIndex[]>;
}
export {};
