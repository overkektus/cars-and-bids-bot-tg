/* eslint-disable no-case-declarations */
import { inject, injectable } from 'inversify';
import { FilterQuery, QueryOptions } from 'mongoose';
import * as puppeteer from 'puppeteer';
import axios from 'axios';
import * as cherio from 'cheerio';

import {
  ICar,
  INotificationMessage,
  ThreadEvent,
} from '../../models/car.interface';
import { TYPES } from '../../types';
import { IModelService } from '../../interfaces/model.interface';
import { IConfigService } from '../config/config.interface';
import { ILogger } from '../logger/loger.interface';
import { IParser } from './parser.interface';

@injectable()
export class Parser implements IParser<INotificationMessage> {
  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.CarService)
    public carService: IModelService<
      ICar,
      FilterQuery<ICar>,
      QueryOptions<ICar>
    >,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {}

  public async setInitialLastEventId(url: string): Promise<void> {
    const LAST_ACTION_LI_SELECTOR = '.comments > .thread > li:first-of-type';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await page.waitForSelector(LAST_ACTION_LI_SELECTOR);

      const actionElement = await page.$(LAST_ACTION_LI_SELECTOR);

      const dataId = await actionElement?.evaluate((el) =>
        el.getAttribute('data-id')
      );

      const car = await this.carService.update(
        { url },
        { lastEventId: dataId },
        { new: true }
      );

      if (!car) {
        throw new Error('Car not found');
      }
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    } finally {
      await browser.close();
    }
  }

  public async checkAuctionUpdates(
    id: string
  ): Promise<INotificationMessage | null> {
    const LAST_THREAD_LI_SELECTOR = '.comments > .thread > li:first-of-type';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      const car = await this.carService.findById(id);

      if (!car) {
        // TODO:
        return null;
      }

      await page.goto(car.url);
      await page.waitForSelector(LAST_THREAD_LI_SELECTOR);

      const lastThreadElement = await page.$(LAST_THREAD_LI_SELECTOR);
      const dataId = await lastThreadElement?.evaluate((el) =>
        el.getAttribute('data-id')
      );

      if (car.lastEventId === dataId) {
        // Nothing new
        return null;
      }

      const newThreadElements = [];
      const newThreadElementIds: Array<string> = [dataId];

      let nextElement = await lastThreadElement!.evaluateHandle(
        (el) => el.nextElementSibling
      );
      let nextDataId = await nextElement?.evaluate((el) =>
        el.getAttribute('data-id')
      );
      while (car.lastEventId !== nextDataId) {
        newThreadElements.push(nextElement);
        newThreadElementIds.push(nextDataId);
        nextElement = await nextElement!.evaluateHandle(
          (el) => el.nextElementSibling
        );
        nextDataId = await nextElement?.evaluate((el) =>
          el.getAttribute('data-id')
        );
      }

      await this.carService.update(
        { id },
        { lastEventId: newThreadElementIds[0] },
        { new: true }
      );

      const result = await Promise.all(
        newThreadElementIds.map((id) => this.transform(page, id)).reverse()
      );

      return {
        carId: id,
        actions: result,
      };
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    } finally {
      await browser.close();
    }
  }

  public async checkIsActionEnd(carURL: string): Promise<boolean> {
    const ACTION_BIDBAR_DIV_SELECTOR = '.auction-bidbar';
    const ACTION_END_DIV_SELECTOR = '.auction-ended-cta';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(carURL);
      await page.waitForSelector(ACTION_BIDBAR_DIV_SELECTOR);

      const actionEndElement = await page.$(ACTION_END_DIV_SELECTOR);

      return !!actionEndElement;
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    } finally {
      await browser.close();
    }
  }

  public async getCarTitle(carURL: string): Promise<string> {
    try {
      const res = await axios.get(carURL);

      const $ = cherio.load(res.data);

      const carTitle = $('title')
        .text()
        .slice(0, $('title').text().indexOf('auction'))
        .trim();

      return carTitle;
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    }
  }

  private async transform(
    page: puppeteer.Page,
    id: string
  ): Promise<ThreadEvent> {
    const ACTION_LI_BY_ID_SELECTOR = `.thread li[data-id="${id}"]`;
    const actionElement = await page.$(ACTION_LI_BY_ID_SELECTOR);
    const className = await actionElement?.evaluate((el) =>
      el.getAttribute('class')
    );

    let actionData: ThreadEvent;

    switch (className) {
      case 'bid':
        const bidElement = await page.$(
          `${ACTION_LI_BY_ID_SELECTOR} > div > div.content > dl > dd`
        );
        const bidValue = await bidElement?.evaluate(
          (el: any) => el.textContent
        );
        actionData = {
          id,
          type: className,
          value: bidValue,
        };
        break;
      case 'system-comment':
        const systemCommentElement = await page.$(
          `${ACTION_LI_BY_ID_SELECTOR} > div.content > div.message > p`
        );
        const systemComment = await systemCommentElement?.evaluate(
          (el: any) => el.textContent
        );
        actionData = {
          id,
          type: className,
          comment: systemComment,
        };
        break;
      case 'comment':
      case 'flagged-comment':
        const commentElement = await page.$(
          `${ACTION_LI_BY_ID_SELECTOR} > div > div.content > div.message > p`
        );
        const comment = await commentElement?.evaluate(
          (el: any) => el.textContent
        );
        actionData = {
          id,
          type: className,
          comment,
        };
        break;
    }
    return actionData!;
  }
}
