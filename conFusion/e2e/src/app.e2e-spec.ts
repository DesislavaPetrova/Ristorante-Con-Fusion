import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying Ristornate Con Fusion', () => {
    page.navigateTo('/');
    expect(page.getParagraphText('app-root h1')).toEqual('Ristorante Con Fusion');
  });

  it('should navigate to about us page by clicking on the link', () => {
    page.navigateTo('/');
    let navlink = page.getAllEments('a').get(1);
    navlink.click();

    expect(page.getParagraphText('h3')).toBe('About Us');
  });

  it('should enter a new comment for the fist dish', () => {
    page.navigateTo('/dishdetail/0');

    const newAuthor = page.getElement('input[type=text]');
    newAuthor.sendKeys('Test Author');
    
    const newComment = page.getElement('textarea');
    newComment.sendKeys('Test Comment');

    const newSubmitButton = page.getElement('button[type=submit]');
    newSubmitButton.click();

    // Pause the test
    browser.pause();
  });

});
