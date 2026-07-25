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
import { Card, Typography } from '@openmetadata/ui-core-components';
import { AxiosError } from 'axios';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from '../../components/common/atoms/navigation/useBreadcrumbs';
import EntityListingTable from '../../components/common/EntityListingTable/EntityListingTable.component';
import { ColumnDef } from '../../components/common/EntityListingTable/EntityListingTable.interface';
import ErrorPlaceHolder from '../../components/common/ErrorWithPlaceholder/ErrorPlaceHolder';
import { OwnerLabel } from '../../components/common/OwnerLabel/OwnerLabel.component';
import { NO_DATA } from '../../constants/constants';
import { ERROR_PLACEHOLDER_TYPE } from '../../enums/common.enum';
import { EntityType, TabSpecificField } from '../../enums/entity.enum';
import { QueryReport } from '../../generated/entity/data/queryReport';
import { useFqn } from '../../hooks/useFqn';
import { getQueryReports } from '../../rest/queryReportAPI';
import {
  getQueryReportYear,
  getQueryReportYearLabel,
} from '../../utils/QueryReportUtils';
import { getEntityDetailsPath } from '../../utils/RouterUtils';
import { showErrorToast } from '../../utils/ToastUtils';

const QueryReportYearDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fqn: year } = useFqn();

  const [queryReports, setQueryReports] = useState<QueryReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueryReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getQueryReports({
        fields: [TabSpecificField.OWNERS, TabSpecificField.TAGS].join(','),
        limit: 100,
      });
      setQueryReports(
        response.data.filter(
          (report) => getQueryReportYear(report.name) === year
        )
      );
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchQueryReports();
  }, [fetchQueryReports]);

  const { breadcrumbs } = useBreadcrumbs({
    items: [
      { name: t('label.query-report-plural'), url: '/queryReports' },
      {
        name: getQueryReportYearLabel(year),
        url: '',
        isActive: true,
      },
    ],
  });

  const columns: ColumnDef[] = useMemo(
    () => [
      { id: 'name', label: t('label.name') },
      { id: 'title', label: t('label.title') },
      { id: 'owners', label: t('label.owner') },
    ],
    [t]
  );

  const renderCell = useCallback(
    (entity: QueryReport, columnId: string): ReactNode => {
      switch (columnId) {
        case 'name':
          return (
            <Typography size="text-sm" weight="medium">
              {entity.name}
            </Typography>
          );
        case 'title':
          return (
            <Typography size="text-sm">
              {entity.displayName || NO_DATA}
            </Typography>
          );
        case 'owners':
          return (
            <OwnerLabel
              isCompactView={false}
              maxVisibleOwners={4}
              owners={entity.owners}
              showLabel={false}
            />
          );
        default:
          return null;
      }
    },
    []
  );

  const handleEntityClick = useCallback(
    (entity: QueryReport) => {
      navigate(
        getEntityDetailsPath(
          EntityType.QUERY_REPORT,
          entity.fullyQualifiedName ?? entity.name
        )
      );
    },
    [navigate]
  );

  const content = useMemo(() => {
    if (!loading && queryReports.length === 0) {
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
      <EntityListingTable
        ariaLabel={t('label.query-report-plural')}
        columns={columns}
        entities={queryReports}
        loading={loading}
        renderCell={renderCell}
        selectedEntities={[]}
        onEntityClick={handleEntityClick}
        onSelect={() => {}}
        onSelectAll={() => {}}
      />
    );
  }, [loading, queryReports, columns, renderCell, handleEntityClick, t]);

  return (
    <>
      {breadcrumbs}
      <Card variant="elevated">{content}</Card>
    </>
  );
};

export default QueryReportYearDetailsPage;
