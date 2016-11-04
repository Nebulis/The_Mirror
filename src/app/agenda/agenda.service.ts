import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';

Array.prototype.flatten = function () {
  return flatten(this)
}
function flatten (list) {
  return list.reduce((a, b) => (Array.isArray(b) ? a.push(...flatten(b)) : a.push(b), a), [])
}

@Injectable()
export class AgendaService {
  public api_url : String = "/app/assets/devfest.json";
  public http : any;

  constructor(http : Http) {
    this.http = http;
  }

  getZenikaSessions(){
    let headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Request-Method': 'GET' });
    let options = new RequestOptions({ headers: headers })
    return this.http
      .get(this.api_url, options)
        .map(res => res.json())
        .map((x) => {
          const zenSpeakers = x.speakers.filter(speaker => speaker.company === 'Zenika');

          const sessionsWithZenSpeakers =
            zenSpeakers
              .map(speaker => speaker.sessions.map(speakerSession => x.sessions.find(session => speakerSession === session.id))) // get sessions
              .flatten()
              .reduce((acc, session) => acc.find(existingSession => existingSession.id === session.id) ? acc : acc.concat(session), []) // remove double

          return sessionsWithZenSpeakers.map(session => {
            const agenda = {
              hour: x.agenda['day'+session.agenda.day].find(hour => hour.id === session.agenda.hour)
            };
            const speakers = session.speaker.map(speaker => x.speakers.find(s => s.id === speaker));
            return Object.assign({},
              { session},
              { speakers },
              { agenda }
            )
          })
        })
      .flatMap(x => x)
  }


}
