export interface Core {
  id?: string;
  marketingName: string;
  coreNumber: string | number;
  weightBlockNumber: string | number;
  line?: string;
  isSymmetric?: boolean;

  // Specs by weight (16lb, 15lb, 14lb, 13lb, 12lb, 11lb, 10lb)
  specs: CoreWeightSpec[];
}

export interface CoreWeightSpec {
  weight: number;
  rg: number;
  differential: number;
  intermediate: number;
}

export interface CoreListItem {
  id?: string;
  marketingName: string;
  coreNumber: string | number;
  line?: string;
  isSymmetric?: boolean;
  weightRange: string;
}
