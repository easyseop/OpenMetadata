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
import { Box, Card, Typography } from '@openmetadata/ui-core-components';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ErrorPlaceHolder from '../../components/common/ErrorWithPlaceholder/ErrorPlaceHolder';
import Loader from '../../components/common/Loader/Loader';
import { OwnerLabel } from '../../components/common/OwnerLabel/OwnerLabel.component';
import RichTextEditorPreviewerV1 from '../../components/common/RichTextEditor/RichTextEditorPreviewerV1';
import TagBadgeList from '../../components/common/TagBadgeList/TagBadgeList.component';
import QueryReportQueryEditor from '../../components/QueryReport/QueryReportQueryEditor/QueryReportQueryEditor.component';
import { ROUTES } from '../../constants/constants';
import { usePermissionProvider } from '../../context/PermissionProvider/PermissionProvider';
import {
  OperationPermission,
  ResourceEntity,
} from '../../context/PermissionProvider/PermissionProvider.interface';
import { ClientErrors } from '../../enums/Axios.enum';
import { ERROR_PLACEHOLDER_TYPE } from '../../enums/common.enum';
import { TabSpecificField } from '../../enums/entity.enum';
import { QueryReport } from '../../generated/entity/data/queryReport';
import { Operation } from '../../generated/entity/policies/accessControl/resourcePermission';
import { useFqn } from '../../hooks/useFqn';
import { getQueryReportByFqn } from '../../rest/queryReportAPI';
import { getEntityMissingError } from '../../utils/CommonUtils';
import {
  DEFAULT_ENTITY_PERMISSION,
  getPrioritizedViewPermission,
} from '../../utils/PermissionsUtils';
import { getClassificationTags } from '../../utils/TagsUtils';
import { showErrorToast } from '../../utils/ToastUtils';

const QueryReportDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fqn: queryReportFqn } = useFqn();
  const { getEntityPermissionByFqn } = usePermissionProvider();

  const [queryReport, setQueryReport] = useState<QueryReport>(
    {} as QueryReport
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [permissions, setPermissions] = useState<OperationPermission>(
    DEFAULT_ENTITY_PERMISSION
  );

  const fetchPermissions = useCallback(async () => {
    try {
      const perms = await getEntityPermissionByFqn(
        ResourceEntity.QUERY_REPORT,
        queryReportFqn
      );
      setPermissions(perms);
    } catch {
      showErrorToast(
        t('server.fetch-entity-permissions-error', {
          entity: queryReportFqn,
        })
      );
    }
  }, [queryReportFqn, getEntityPermissionByFqn, t]);

  const fetchQueryReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getQueryReportByFqn(queryReportFqn, {
        fields: [
          TabSpecificField.OWNERS,
          TabSpecificField.FOLLOWERS,
          TabSpecificField.TAGS,
          TabSpecificField.DOMAINS,
        ].join(','),
      });
      setQueryReport(res);
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        setIsError(true);
      } else if (
        (error as AxiosError)?.response?.status === ClientErrors.FORBIDDEN
      ) {
        navigate(ROUTES.FORBIDDEN, { replace: true });
      } else {
        showErrorToast(
          error as AxiosError,
          t('server.entity-details-fetch-error', {
            entityType: t('label.query-report'),
            entityName: queryReportFqn,
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [queryReportFqn, navigate, t]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (getPrioritizedViewPermission(permissions, Operation.ViewBasic)) {
      fetchQueryReport();
    }
  }, [permissions, fetchQueryReport]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorPlaceHolder>
        {getEntityMissingError('queryReport', queryReportFqn)}
      </ErrorPlaceHolder>
    );
  }

  if (!permissions.ViewAll && !permissions.ViewBasic) {
    return (
      <ErrorPlaceHolder
        className="border-none"
        permissionValue={t('label.view-entity', {
          entity: t('label.query-report'),
        })}
        type={ERROR_PLACEHOLDER_TYPE.PERMISSION}
      />
    );
  }

  return (
    <Box direction="col" gap={5}>
      <Card style={{ padding: 20 }} variant="elevated">
        <Box direction="col" gap={3}>
          <Typography as="h3">
            {queryReport.displayName || queryReport.name}
          </Typography>
          <RichTextEditorPreviewerV1 markdown={queryReport.description || ''} />
          <Box align="center" direction="row" gap={5}>
            <OwnerLabel owners={queryReport.owners} />
            <TagBadgeList tags={getClassificationTags(queryReport.tags)} />
          </Box>
          {queryReport.reportType && (
            <Typography size="text-sm">
              {t('label.type')}: {queryReport.reportType}
            </Typography>
          )}
        </Box>
      </Card>
      <Card style={{ padding: 20 }} variant="elevated">
        <QueryReportQueryEditor queryReportId={queryReport.id} />
      </Card>
    </Box>
  );
};

export default QueryReportDetailsPage;
