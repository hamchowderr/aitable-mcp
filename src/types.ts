// AITable API Types

export interface AITableRecord {
  recordId: string;
  createdAt: number;
  updatedAt: number;
  fields: Record<string, any>;
}

export interface AITableResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

export interface GetRecordsResponse {
  records: AITableRecord[];
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface CreateRecordsResponse {
  records: AITableRecord[];
}

export interface UpdateRecordsResponse {
  records: AITableRecord[];
}

export interface DeleteRecordsResponse {
  // API returns boolean indicating success
  // The actual deleted record IDs are in the request, not the response
}

export interface MetaFieldItem {
  id: string;
  name: string;
  type: string;
  desc?: string;
  property?: Record<string, any>;
  defaultValue?: string;
  isPrimary?: boolean;
  editable?: boolean;
}

export interface GetFieldsResponse {
  fields: MetaFieldItem[];
}

export interface CreateFieldResponse {
  id?: string;
  name?: string;
}

export interface DeleteFieldResponse {
  // API returns success boolean in the base response
}

export interface MetaViewItem {
  id: string;
  name: string;
  type: string;
}

export interface GetViewsResponse {
  views: MetaViewItem[];
}

export interface FieldItemRo {
  type: string;
  name: string;
  property: Record<string, any>;
}

export interface FieldCreateItemVo {
  id?: string;
  name?: string;
}

export interface CreateDatasheetResponse {
  id?: string;
  createdAt?: number;
  fields?: FieldCreateItemVo[];
}

export interface NodeItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
}

export interface GetNodeListResponse {
  nodes: NodeItem[];
}

export interface UploadAttachmentResponse {
  token: string;
  name: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
}

export interface SearchNodesResponse {
  // The data structure is not fully specified in the documentation
  // Based on the pattern, it should return similar data to GetNodeListResponse
  nodes?: NodeItem[];
  [key: string]: any;
}

export interface EmbedLinkToolBarDto {
  basicTools?: boolean;
  widgetBtn?: boolean;
  apiBtn?: boolean;
  formBtn?: boolean;
  historyBtn?: boolean;
  robotBtn?: boolean;
  addWidgetBtn?: boolean;
  fullScreenBtn?: boolean;
  formSettingBtn?: boolean;
  collapsed?: boolean;
}

export interface EmbedLinkViewControlDto {
  viewId?: string;
  tabBar?: boolean;
  toolBar?: EmbedLinkToolBarDto;
}

export interface EmbedLinkPrimarySideBarDto {
  collapsed?: boolean;
}

export interface EmbedLinkPayloadDto {
  primarySideBar?: EmbedLinkPrimarySideBarDto;
  viewControl?: EmbedLinkViewControlDto;
  nodeInfoBar?: boolean;
  collaboratorStatusBar?: boolean;
  bannerLogo?: boolean;
  permissionType?: string;
  theme?: string;
}

export interface CreateEmbedLinkResponse {
  payload?: EmbedLinkPayloadDto;
  linkId: string;
  url: string;
}

export interface NodeDetailItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
  children?: NodeItem[][]; // Only present when type is 'Folder' - array of arrays containing child nodes
}

export interface GetNodeDetailResponse {
  // The API returns the NodeDetailItem directly as data
  id: string;
  name: string;
  type: string;
  icon: string;
  isFav: boolean;
  children?: NodeItem[][];
}

export interface EmbedLinkDto {
  payload?: EmbedLinkPayloadDto;
  linkId: string;
  url: string;
}

export interface GetEmbedLinksResponse {
  // API returns an array of EmbedLinkDto objects
  embedLinks?: EmbedLinkDto[];
  [key: string]: any;
}

export interface DeleteEmbedLinkResponse {
  // API returns success boolean in the base response
  // No data field in the response
}
