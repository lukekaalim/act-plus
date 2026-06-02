import { DocApp } from "../application";
import { PageContent } from "../application/Page";
import { kebabCase } from "change-case";

export type BookPageRef = {
  page: BookPage,
  section: BookSection,
  book: Book,
}

type BookPage = {
  name: string,
  path: string,

  sectionName: string,

  content: PageContent,
}

type BookSection = {
  name: string,
  path: string,

  index: BookPage | null,
  pages: BookPage[]
}

/**
 * A "Book" is a structured collection
 * of pages, (optionally) organized into sections.
 * 
 * This lets Grimoire make some assumptions about linking,
 * navigation, and routing. It can be added to a DocApp with
 * `doc.page.addBook(book, pathForBook)`, and it's pages
 * will be available as paths/subpaths
 */
export type Book = {
  /**
   * A name for the entire book, will be used as the heading text.
   */
  name: string,

  /**
   * A prefix of the URL that this book will be make pages for.
   */
  basePath: string,

  /**
   * Top level articles (which appear immediatly under the heading)
   * and don't have an associated section.
   * 
   * The "name" is ignored.
   */
  top: BookSection,
  sections: BookSection[]
};

export class BookSectionBuilder {
  parent: BookBuilder;
  target: BookSection;

  constructor(builder: BookBuilder, section: BookSection) {
    this.parent = builder;
    this.target = section;
  }

  /**
   * Create a new section of the parent book. Returns 
   * @param name 
   * @returns a _different_ `BookSectionBuilder` instance than
   *  the one this method is called on.
   */
  section(name: string) {
    return this.parent.section(name)
  }

  page(name: string, content: PageContent) {
    const path = [
      this.target.path,
      kebabCase(name)
    ].filter(Boolean).join('/');

    const page = {
      name,
      path,

      sectionName: this.target.name,
      content,
    }

    this.target.pages.push(page)

    this.parent.app.page.add(path, content);
    this.parent.app.page.bookRefByPath.set(path, {
      page,
      section: this.target,
      book: this.parent.result
    });

    return this;
  }

  index(content: PageContent) {
    this.target.index = {
      name: this.target.name,
      path: this.target.path,
      sectionName: this.target.name,
      content,
    };
    this.parent.app.page.add(this.target.path, content);

    this.parent.app.page.bookRefByPath.set(this.target.path, {
      page: this.target.index,
      section: this.target,
      book: this.parent.result
    });
    
    return this;
  }

  link(name: string | null, path: string) {
    const bookPage: BookPage = {
      name: name || this.target.name,
      path,
      content: { type: 'node', node: null },
      sectionName: this.target.name,
    };
    if (!name) {
      this.target.index = bookPage;
    } else {
      this.target.pages.push(bookPage);
    }
    
    // KLUDGE: this is a shitty way to do this
    if (!this.parent.app.page.bookRefByPath.has(path)) {
      this.parent.app.page.bookRefByPath.set(path, {
        page: bookPage,
        section: this.target,
        book: this.parent.result
      });
    }
  }
}

type ArticleData = { key: string, content: string, name: string }

/**
 * Utility class to build books in a more ergonomic manner.
 */
export class BookBuilder {
  app: DocApp;
  top: BookSectionBuilder;

  result: Book;

  /**
   * A set of pending article data
   */
  articles: ArticleData[];

  constructor(app: DocApp, name: string, basePath: string) {
    this.result = {
      name,
      basePath,
      top: { name: '', pages: [], index: null, path: basePath },
      sections: []
    };
    this.articles = [];
    this.app = app;
    this.top = new BookSectionBuilder(this, this.result.top);
  }

  index(content: PageContent) {
    this.top.index(content);
    return this;
  }

  section(name: string) {
    const path = [
      this.result.basePath,
      kebabCase(name)
    ].filter(Boolean).join('/');

    const section: BookSection = { name, index: null, pages: [], path };
    this.result.sections.push(section);
    
    return new BookSectionBuilder(this, section);
  }

  page(name: string, content: PageContent) {
    this.top.page(name, content);
    return this;
  }

  link(name: string | null, path: string) {
    this.top.link(name, path);
    return this;
  }
}


/**
 * From a particular location inside a book,
 * determine what the "Next" and "Previous"
 * pages should be.
 * @param bookRef
 */
export const getBookPaginationLinks = (bookRef: BookPageRef) => {
  const allPages = flattenBook(bookRef.book);

  // if -1, this page is probably the index.
  const pageIndex = allPages.indexOf(bookRef.page);

  return {
    prev: allPages[pageIndex - 1] || null,
    next: allPages[pageIndex + 1] || null
  }
}

export const flattenBook = (book: Book) => {
  const flattenSection = (section: BookSection) => {
    return [
      section.index,
      ...section.pages,
    ].filter(x => !!x);
  }
  
  return [
    book.top,
    ...book.sections,
  ].map(flattenSection).flat(1);
}