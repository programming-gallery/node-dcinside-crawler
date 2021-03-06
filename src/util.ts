//const Queue = require("denque");
import Queue from 'denque';
//const PriorityQueue = require("tinyqueue");

export class AsyncQueue {
  resolverQ: Queue;
  q: Queue;
  constructor(){
    //this.q = new PriorityQueue(...args);
    this.resolverQ = new Queue();
    this.q = new Queue();
  }
  push(val: any) {
    let resolver = this.resolverQ.shift();
    if(resolver !== undefined)
      resolver(val);
    else
      this.q.push(val)
  }
  async pop(): Promise<any> {
    let next = this.q.shift();
    if(next !== undefined)
      return next;
    else
      return new Promise(resolver => this.resolverQ.push(resolver));
  }
  /*
  peek(): any {
    return this.q.peek();
  }
  iterator(): any[] {
    // monkey patch
    return this.q.data;
  }
  */
  /*
  remove(pos): any {
    // monkey patch
    let target = this.q.data[pos];
    let bottom = this.q.data.pop()
    if(--this.q.length > 0){
      this.q.data[pos] = bottom;
      this.q._down(pos);
    }
    return target;
  }
  */
}

export async function* PromiseIterator(promises: Promise<any>[]) {
  let q = new AsyncQueue();
  promises.map(p => p.then(r => q.push({success: true, result: r})).catch(e => q.push({success: false, error: e})));
  for(let i=0; i<promises.length; ++i){
    yield await q.pop();
  }
}

export function koreaDateParse(val: string): Date {
  let date: Date;
  let now = new Date();
  now = new Date(now.getTime() + 540 * 60 * 1000);
  if(/^\d\d\/\d\d\/\d\d$/.exec(val))
    date = new Date('20' + val);
  else if(/^\d\d\.\d\d\.\d\d$/.exec(val))
    date = new Date('20' + val);
  else if(/^\d\d\.\d\d$/.exec(val))
    date = new Date(now.getFullYear() + '.' + val);
  else if(/^\d\d\/\d\d$/.exec(val))
    date = new Date(now.getFullYear() + '/' + val);
  else if(/^\d\d-d\d$/.exec(val))
    date = new Date(now.getFullYear() + '.' + val);
  else if(/^\d\d:\d\d$/.exec(val))
    date = new Date(now.toISOString().slice(0, 10) + ' ' + val);
  else
    date = new Date(val + ' ');
  return new Date(date.getTime() + (date.getTimezoneOffset() + 540) * 60 * 1000);
}
