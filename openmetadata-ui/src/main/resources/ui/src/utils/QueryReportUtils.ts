/*
 *  Copyright 2026 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import i18n from './i18next/LocalUtil';

export const UNKNOWN_QUERY_REPORT_YEAR = 'unknown';

/**
 * QueryReport names follow the convention `P{year}{...}` (e.g. `P20262464119`).
 * Falls back to a single "Unknown" bucket when a report name doesn't carry a
 * recognizable 4-digit year.
 */
export const getQueryReportYear = (name: string): string => {
  const match = name.match(/(20\d{2})/);

  return match ? match[1] : UNKNOWN_QUERY_REPORT_YEAR;
};

export const getQueryReportYearLabel = (year: string): string => {
  return year === UNKNOWN_QUERY_REPORT_YEAR ? i18n.t('label.unknown') : year;
};
