export interface Ball {
  id?: string;
  recordNumber?: number;
  version?: number;
  sku?: string;
  ballName: string;
  brand: string;
  line?: string;
  releaseType: 'OEM' | 'WWR' | string;

  // Dates
  releaseDate?: Date | string;
  shipDate?: Date | string;
  usbcPosting?: Date | string;
  startDate?: Date | string;

  // Coverstock
  coverstock: string;
  coverstockType?: string;
  finish: string;
  originalFinish?: string;
  productionFinish?: string;

  // Core
  core: string;
  coreNumber?: string;
  weightBlockNumber?: string;

  // Colors
  marketingColorName?: string;
  colors: BallColor[];
  pinColor?: string;

  // Fragrance
  fragrance?: string;
  fragranceMarketing?: string;

  // Logos
  logos?: BallLogos;

  // Core specs by weight
  coreSpecs?: CoreSpecsByWeight;

  // Workflow tracking
  workflow?: WorkflowStatus;

  // Notes
  specialNotes?: string;
  drillInstructions?: string;

  // Audit
  createdBy?: string;
  createdAt?: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
}

export interface BallColor {
  colorNumber: number;
  color: string;
  shade?: string;
}

export interface BallLogos {
  top?: LogoConfig;
  left?: LogoConfig;
  right?: LogoConfig;
  mid?: LogoConfig;
  psa?: LogoConfig;
}

export interface LogoConfig {
  logo?: string;
  color?: string;
}

export interface CoreSpecsByWeight {
  [weight: number]: CoreSpec;
}

export interface CoreSpec {
  weight: number;
  rg: number;
  differential: number;
  intermediate?: number;
  coreNumber?: string;
  weightBlockNumber?: string;
}

export interface WorkflowStatus {
  colorRequestSent?: WorkflowStep;
  colorApproved?: WorkflowStep;
  logoCreationRequest?: WorkflowStep;
  logoMarketingApproved?: WorkflowStep;
  logoEngraving?: WorkflowStep;
  logoProduction?: WorkflowStep;
  boxingCadEntered?: WorkflowStep;
  boxingTechDataEntered?: WorkflowStep;
  stickerApproved?: WorkflowStep;
  sampleBallsRequested?: WorkflowStep;
  internalSamplesRequested?: WorkflowStep;
  ballApproved?: WorkflowStep;
  orderReceived?: WorkflowStep;
  skuRequested?: WorkflowStep;
  packetCompleted?: WorkflowStep;
  usbcPaperwork?: WorkflowStep;
  usbcBalls?: WorkflowStep;
  pbaBalls?: WorkflowStep;
  photoBall?: WorkflowStep;
  bucketDisc?: WorkflowStep;
}

export interface WorkflowStep {
  completedBy?: string;
  completedDate?: Date | string;
}

export interface BallListItem {
  id?: string;
  ballName: string;
  brand: string;
  releaseType: string;
  releaseDate?: Date | string;
  coverstock: string;
  core: string;
  coverstockType?: string;
  finish: string;
  marketingColorName?: string;
  fragrance?: string;
}
