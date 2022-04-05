import { Component, Input, OnInit } from '@angular/core';
import { Article } from 'functions/src/shared/types';

@Component({
  selector: 'app-news-heading',
  templateUrl: './news-heading.component.html',
  styleUrls: ['./news-heading.component.scss'],
})
export class NewsHeadingComponent {
  @Input()
  article: Article;
}
