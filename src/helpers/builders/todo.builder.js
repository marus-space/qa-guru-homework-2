import { faker } from '@faker-js/faker';

export class TodoBuilder {
  withTitle() {
    this.title = faker.lorem.sentence(5);
    return this;
  }
  withDoneStatus(doneStatus) {
    this.doneStatus = doneStatus ?? faker.datatype.boolean();
    return this;
  }
  withDescription() {
    this.description = faker.lorem.sentence(10);
    return this;
  }
  build() {
    return { ...this };
  }
}
