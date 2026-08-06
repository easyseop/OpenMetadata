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
import {
  Badge,
  Box,
  Card,
  FeaturedIcon,
  Typography,
} from '@openmetadata/ui-core-components';
import { Folder } from '@untitledui/icons';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ERROR_PLACEHOLDER_TYPE } from '../../enums/common.enum';
import { QueryReport } from '../../generated/entity/data/queryReport';
import { withPageLayout } from '../../hoc/withPageLayout';
import { getQueryReports } from '../../rest/queryReportAPI';
import {
  getQueryReportYear,
  getQueryReportYearLabel,
} from '../../utils/QueryReportUtils';
import { getQueryReportYearPath } from '../../utils/RouterUtils';
import { showErrorToast } from '../../utils/ToastUtils';
import { useBreadcrumbs } from '../common/atoms/navigation/useBreadcrumbs';
import { usePageHeader } from '../common/atoms/navigation/usePageHeader';
import { useTitleAndCount } from '../common/atoms/navigation/useTitleAndCount';
import ErrorPlaceHolder from '../common/ErrorWithPlaceholder/ErrorPlaceHolder';
import Loader from '../common/Loader/Loader';

interface YearGroup {
  year: string;
  count: number;
}

const groupByYear = (queryReports: QueryReport[]): YearGroup[] => {
  const yearMap = new Map<string, number>();
  queryReports.forEach((report) => {
    const year = getQueryReportYear(report.name);
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
  });

  return Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year.localeCompare(a.year));
};

const QueryReportListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [queryReports, setQueryReports] = useState<QueryReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueryReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getQueryReports({ limit: 100 });
      setQueryReports(response.data);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueryReports();
  }, [fetchQueryReports]);

  const years = useMemo(() => groupByYear(queryReports), [queryReports]);

  const { breadcrumbs } = useBreadcrumbs({
    items: [{ name: t('label.query-report-plural'), url: '', isActive: true }],
  });

  const { pageHeader } = usePageHeader({
    titleKey: 'label.query-report-plural',
    descriptionMessageKey: 'message.query-report-description',
    createPermission: false,
  });

  const { titleAndCount } = useTitleAndCount({
    titleKey: 'label.year',
    count: years.length,
    loading,
  });

  const handleYearClick = useCallback(
    (year: string) => {
      navigate(getQueryReportYearPath(year));
    },
    [navigate]
  );

  const content = useMemo(() => {
    if (loading) {
      return <Loader />;
    }

    if (years.length === 0) {
      return (
        <ErrorPlaceHolder
          className="border-none"
          heading={t('message.no-data-message', {
            entity: t('label.query-report-lowercase-plural'),
          })}
          type={ERROR_PLACEHOLDER_TYPE.NO_DATA}
        />
      );
    }

    return (
      <Box className="tw:grid tw:grid-cols-1 tw:gap-4 tw:px-6 tw:py-5 tw:md:grid-cols-2 tw:lg:grid-cols-3">
        {years.map((group) => (
          <Card
            isClickable
            key={group.year}
            style={{ padding: 20 }}
            variant="elevated"
            onClick={() => handleYearClick(group.year)}>
            <Box direction="col" gap={4}>
              <Box align="center" direction="row" justify="between">
                <FeaturedIcon
                  color="brand"
                  icon={Folder}
                  size="md"
                  theme="light"
                />
                <Badge color="gray" size="sm">
                  {group.count}
                </Badge>
              </Box>
              <Typography size="text-md" weight="semibold">
                {getQueryReportYearLabel(group.year)}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }, [loading, years, handleYearClick, t]);

  return (
    <>
      {breadcrumbs}
      {pageHeader}
      <Card style={{ marginBottom: 20 }} variant="elevated">
        <Box
          className="tw:px-6 tw:py-4 tw:border-b tw:border-secondary"
          direction="row"
          gap={5}>
          {titleAndCount}
        </Box>
        {content}
      </Card>
    </>
  );
};

export { QueryReportListPage };

export default withPageLayout(QueryReportListPage);
