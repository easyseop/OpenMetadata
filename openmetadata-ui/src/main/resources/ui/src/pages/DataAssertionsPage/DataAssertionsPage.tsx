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
  Button,
  Card,
  FeaturedIcon,
  Table,
  TableCard,
  Typography,
} from '@openmetadata/ui-core-components';
import { RefreshCw01, ShieldTick, XClose } from '@untitledui/icons';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreadcrumbs } from '../../components/common/atoms/navigation/useBreadcrumbs';
import Loader from '../../components/common/Loader/Loader';
import { NO_DATA } from '../../constants/constants';
import { TestCase, TestCaseStatus } from '../../generated/tests/testCase';
import { getAllTestCases } from '../../rest/dataAssertionsAPI';
import { getEntityColumnFQN, getEntityFQN } from '../../utils/FeedUtils';
import { showSuccessToast } from '../../utils/ToastUtils';

interface AssertionRow {
  id: string;
  name: string;
  tableFqn: string;
  columnName: string;
  category: string;
  status?: TestCaseStatus;
  ownerName?: string;
  message?: string;
}

const CATEGORY_SEPARATOR = ' - ';

const getCategoryFromDisplayName = (
  displayName?: string,
  fallback?: string
) => {
  const [category] = (displayName ?? '').split(CATEGORY_SEPARATOR);

  return category || fallback || '';
};

const toRow = (tc: TestCase, otherLabel: string): AssertionRow => {
  const tableFqn = getEntityFQN(tc.entityLink) ?? '';
  const columnFqn = getEntityColumnFQN(tc.entityLink) ?? '';
  const columnName = columnFqn ? columnFqn.split('.').pop() ?? '' : '';
  const owner = tc.owners?.[0];

  return {
    id: tc.id ?? tc.name,
    name: tc.name,
    tableFqn,
    columnName,
    category: getCategoryFromDisplayName(tc.displayName, otherLabel),
    status: tc.testCaseResult?.testCaseStatus,
    ownerName: owner?.displayName ?? owner?.name,
    message: tc.testCaseResult?.result,
  };
};

const DataAssertionsPage = () => {
  const { t } = useTranslation();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTestCases({
        limit: 200,
        fields: 'testCaseResult,owners',
      } as never);
      setTestCases(response.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error as AxiosError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const { breadcrumbs } = useBreadcrumbs({
    items: [
      { name: t('label.data-assertion-plural'), url: '', isActive: true },
    ],
  });

  const rows = useMemo(() => {
    const otherLabel = t('label.other');

    return testCases
      .map((tc) => toRow(tc, otherLabel))
      .sort((a, b) => {
        if (a.status === b.status) {
          return a.tableFqn.localeCompare(b.tableFqn);
        }

        return a.status === TestCaseStatus.Failed ? -1 : 1;
      });
  }, [testCases, t]);

  const stats = useMemo(() => {
    const total = rows.length;
    const success = rows.filter(
      (r) => r.status === TestCaseStatus.Success
    ).length;
    const failed = rows.filter(
      (r) => r.status === TestCaseStatus.Failed
    ).length;
    const passRate = total > 0 ? Math.round((success / total) * 100) : 0;

    const byCategory = new Map<string, { success: number; failed: number }>();
    rows.forEach((r) => {
      const entry = byCategory.get(r.category) ?? { success: 0, failed: 0 };
      if (r.status === TestCaseStatus.Success) {
        entry.success += 1;
      } else if (r.status === TestCaseStatus.Failed) {
        entry.failed += 1;
      }
      byCategory.set(r.category, entry);
    });

    return { total, success, failed, passRate, byCategory };
  }, [rows]);

  const handleRevalidate = useCallback(() => {
    // Button is intentionally a placeholder for now — clicking it will later
    // navigate to a dedicated re-validation run page.
    showSuccessToast(t('message.data-assertions-revalidate-placeholder'));
  }, [t]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box className="tw:px-6 tw:py-5" direction="col" gap={5}>
      {breadcrumbs}
      <Box align="center" direction="row" justify="between">
        <Typography size="text-xl" weight="semibold">
          {t('label.data-assertion-plural')}
        </Typography>
        <Button
          color="primary"
          iconLeading={RefreshCw01}
          onClick={handleRevalidate}>
          {t('label.re-validate-data')}
        </Button>
      </Box>

      <Box className="tw:grid tw:grid-cols-1 tw:gap-4 tw:md:grid-cols-4">
        <Card style={{ padding: 20 }} variant="elevated">
          <Box direction="col" gap={2}>
            <Typography className="tw:text-secondary" size="text-sm">
              {t('label.total-entity', { entity: t('label.test-case-plural') })}
            </Typography>
            <Typography size="display-xs" weight="semibold">
              {stats.total}
            </Typography>
          </Box>
        </Card>
        <Card style={{ padding: 20 }} variant="elevated">
          <Box direction="col" gap={2}>
            <Box align="center" direction="row" gap={2}>
              <FeaturedIcon
                color="success"
                icon={ShieldTick}
                size="sm"
                theme="light"
              />
              <Typography className="tw:text-secondary" size="text-sm">
                {t('label.success')}
              </Typography>
            </Box>
            <Typography size="display-xs" weight="semibold">
              {stats.success}
            </Typography>
          </Box>
        </Card>
        <Card style={{ padding: 20 }} variant="elevated">
          <Box direction="col" gap={2}>
            <Box align="center" direction="row" gap={2}>
              <FeaturedIcon
                color="error"
                icon={XClose}
                size="sm"
                theme="light"
              />
              <Typography className="tw:text-secondary" size="text-sm">
                {t('label.failed')}
              </Typography>
            </Box>
            <Typography size="display-xs" weight="semibold">
              {stats.failed}
            </Typography>
          </Box>
        </Card>
        <Card style={{ padding: 20 }} variant="elevated">
          <Box direction="col" gap={2}>
            <Typography className="tw:text-secondary" size="text-sm">
              {t('label.pass-rate')}
            </Typography>
            <Typography size="display-xs" weight="semibold">
              {stats.passRate}%
            </Typography>
          </Box>
        </Card>
      </Box>

      <Box className="tw:grid tw:grid-cols-1 tw:gap-4 tw:md:grid-cols-2">
        {Array.from(stats.byCategory.entries()).map(([category, counts]) => (
          <Card key={category} style={{ padding: 20 }} variant="outlined">
            <Box direction="col" gap={2}>
              <Typography weight="semibold">{category}</Typography>
              <Box direction="row" gap={3}>
                <Badge color="success" size="sm">
                  {t('label.success')}: {counts.success}
                </Badge>
                <Badge color="error" size="sm">
                  {t('label.failed')}: {counts.failed}
                </Badge>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      <TableCard.Root>
        <TableCard.Header title={t('label.test-case-plural')} />
        <Table aria-label={t('label.data-assertion-plural')} size="md">
          <Table.Header
            columns={[
              { id: 'tableFqn', label: t('label.table') },
              { id: 'columnName', label: t('label.column') },
              { id: 'category', label: t('label.category') },
              { id: 'status', label: t('label.status') },
              { id: 'ownerName', label: t('label.owner') },
              { id: 'message', label: t('label.message') },
            ]}>
            {(col) => <Table.Head id={col.id} key={col.id} label={col.label} />}
          </Table.Header>
          <Table.Body items={rows}>
            {(row) => (
              <Table.Row
                columns={[
                  { id: 'tableFqn' },
                  { id: 'columnName' },
                  { id: 'category' },
                  { id: 'status' },
                  { id: 'ownerName' },
                  { id: 'message' },
                ]}
                id={row.id}
                key={row.id}>
                {(col) => (
                  <Table.Cell key={col.id}>
                    {col.id === 'tableFqn' && (
                      <Typography size="text-sm" weight="medium">
                        {row.tableFqn.split('.').pop()}
                      </Typography>
                    )}
                    {col.id === 'columnName' && (
                      <Typography className="tw:font-mono" size="text-sm">
                        {row.columnName}
                      </Typography>
                    )}
                    {col.id === 'category' && (
                      <Typography size="text-sm">{row.category}</Typography>
                    )}
                    {col.id === 'status' && (
                      <Badge
                        color={
                          row.status === TestCaseStatus.Success
                            ? 'success'
                            : 'error'
                        }
                        size="sm">
                        {row.status ?? NO_DATA}
                      </Badge>
                    )}
                    {col.id === 'ownerName' && (
                      <Typography size="text-sm">
                        {row.ownerName ?? NO_DATA}
                      </Typography>
                    )}
                    {col.id === 'message' && (
                      <Typography className="tw:text-secondary" size="text-sm">
                        {row.message ?? NO_DATA}
                      </Typography>
                    )}
                  </Table.Cell>
                )}
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </TableCard.Root>
    </Box>
  );
};

export default DataAssertionsPage;
