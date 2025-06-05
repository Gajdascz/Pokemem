import { Base } from '../Base';

export interface MetaState {
  id: string;
  runNumber: number;
  createdAt: string | Date;
  lastUpdated: string | Date;
}
export class Meta extends Base<MetaState> {
  constructor(initial?: MetaState) {
    super(
      (): MetaState => ({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        runNumber: 0
      }),
      (meta: Partial<MetaState>) => {
        if (typeof meta.id !== 'string' || meta.id.length === 0)
          throw new Error('Invalid Meta ID');
        if (typeof meta.runNumber !== 'number' || meta.runNumber < 0)
          throw new Error('Invalid run number');
        if (
          !(meta.createdAt instanceof Date)
          || (typeof meta.createdAt === 'string'
            && isNaN(Date.parse(meta.createdAt)))
        )
          throw new Error('Invalid createdAt date');
        if (
          !(meta.lastUpdated instanceof Date)
          || (typeof meta.lastUpdated === 'string'
            && isNaN(Date.parse(meta.lastUpdated)))
        )
          throw new Error('Invalid lastUpdated date');
      },
      initial
    );
  }
  private update(
    newMeta: Omit<Partial<MetaState>, 'createdAt' | 'lastUpdated'>
  ) {
    this.set({
      ...this.state,
      ...newMeta,
      lastUpdated: new Date().toISOString()
    });
    return this;
  }
  incrementRunNumber() {
    this.update({ runNumber: this.state.runNumber + 1 });
    return this;
  }

  get id() {
    return this.state.id;
  }
  get createAt() {
    return this.state.createdAt;
  }
  get lastUpdated() {
    return this.state.lastUpdated;
  }
  get runNumber() {
    return this.state.runNumber;
  }
}
