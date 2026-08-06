import { faker } from '@faker-js/faker';

export class TodoBuilder {
  /**
   * Поле создается на сервере автоматически.
   */
  withId({ min, max }) {
    this.id = faker.number.int({ min, max });
    return this;
  }
  withTitle({ length } = {}) {
    this.title = length !== undefined
      ? faker.string.alpha(length)
      : faker.lorem.sentence(5);
    return this;
  }
  withDoneStatus(doneStatus) {
    this.doneStatus = doneStatus ?? faker.datatype.boolean();
    return this;
  }
  withDescription({ length } = {}) {
    this.description = length !== undefined
      ? faker.string.alpha(length)
      : faker.lorem.sentence(10);
    return this;
  }
  /**
   * Несуществующее поле.
   */
  withDeadline() {
    this.deadline = faker.date.future();
    return this;
  }
  build() {
    return { ...this };
  }
}
