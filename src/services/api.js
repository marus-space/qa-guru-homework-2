import { ChallengerService } from './challenger.service';
import { ChallengesService } from './challenges.service';
import { TodosService } from './todos.service';
import { TodoService } from './todo.service';
import { HeartbeatService } from './heartbeat.service';

export class Api {
  constructor(request) {
    this.request = request;
    this.challenger = new ChallengerService(request);
    this.challenges = new ChallengesService(request);
    this.todos = new TodosService(request);
    this.todo = new TodoService(request);
    this.heartbeat = new HeartbeatService(request);
  }
}
