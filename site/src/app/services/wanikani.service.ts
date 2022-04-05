import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Assignment, Subject } from 'functions/src/shared/wanikani_types';
import { UserWord } from 'functions/src/shared/firestore_types';

@Injectable({
  providedIn: 'root',
})
export class WanikaniService {
  apiRoot = 'https://api.wanikani.com/v2/';

  constructor(private httpClient: HttpClient) {}

  async getMaxLevel(apiKey: string): Promise<number> {
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + apiKey });
    const nextPage = this.apiRoot + 'user';
    const response = await this.httpClient
      .get<JSON>(nextPage, { headers })
      .toPromise();
    const level = response['data']['subscription']['max_level_granted'];
    console.log(level);
    return Number.parseInt(level);
  }

  async getAssignments(apiKey: string): Promise<Assignment[]> {
    const assignments: Assignment[] = [];
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + apiKey });
    let nextPage = this.apiRoot + 'assignments?subject_types=vocabulary';
    do {
      const response = await this.httpClient
        .get<JSON>(nextPage, { headers })
        .toPromise();
      response['data'].forEach((element) => {
        assignments.push(element['data']);
      });
      nextPage = response['pages']['next_url'];
    } while (nextPage != null);
    return assignments;
  }

  async getSubjects(apiKey: string, type: string): Promise<Subject[]> {
    const subjects: Subject[] = [];
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + apiKey });
    let nextPage = this.apiRoot + 'subjects?types=' + type;
    do {
      const response = await this.httpClient
        .get<JSON>(nextPage, { headers })
        .toPromise();
      response['data'].forEach((element) => {
        const subject: Subject = element['data'];
        subject.id = element['id'];
        subjects.push(element['data']);
      });
      nextPage = response['pages']['next_url'];
    } while (nextPage != null);
    return subjects;
  }

  async getUserWords(apiKey: string): Promise<UserWord[]> {
    const vocab = await this.getSubjects(apiKey, 'vocabulary');
    const assignments = await this.getAssignments(apiKey);
    const subjectMap = new Map<number, UserWord>();
    vocab.forEach((word) =>
      subjectMap.set(word.id, {
        id: word.id,
        c: word.characters,
        l: word.level,
        s: -1,
      })
    );
    assignments.forEach(
      (assignment) =>
        (subjectMap.get(assignment.subject_id).s = assignment.srs_stage)
    );
    // Drop future works that are still locked.
    return Array.from(subjectMap.values()).filter((s) => s.s !== -1);
  }
}
