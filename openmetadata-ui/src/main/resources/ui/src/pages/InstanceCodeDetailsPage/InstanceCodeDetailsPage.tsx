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
import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import ErrorPlaceHolder from '../../components/common/ErrorWithPlaceholder/ErrorPlaceHolder';
import Loader from '../../components/common/Loader/Loader';
import { ROUTES } from '../../constants/constants';
import { usePermissionProvider } from '../../context/PermissionProvider/PermissionProvider';
import {
  OperationPermission,
  ResourceEntity,
} from '../../context/PermissionProvider/PermissionProvider.interface';
import { ClientErrors } from '../../enums/Axios.enum';
import { ERROR_PLACEHOLDER_TYPE } from '../../enums/common.enum';
import { Operation } from '../../generated/entity/policies/accessControl/resourcePermission';
import { useFqn } from '../../hooks/useFqn';
import { getInstanceCodeByFqn } from '../../rest/instanceCodeAPI';
import { getEntityMissingError } from '../../utils/CommonUtils';
import {
  DEFAULT_ENTITY_PERMISSION,
  getPrioritizedViewPermission,
} from '../../utils/PermissionsUtils';
import { getInstanceCodeGroupPath } from '../../utils/RouterUtils';
import { showErrorToast } from '../../utils/ToastUtils';

/**
 * Individual InstanceCode entities are rows within a code group. There is no
 * standalone single-code view — visiting a code's own URL (e.g. from Explore
 * search results) redirects to its group's table page.
 */
const InstanceCodeDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { fqn: instanceCodeFqn } = useFqn();
  const { getEntityPermissionByFqn } = usePermissionProvider();

  const [codeGroup, setCodeGroup] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [permissions, setPermissions] = useState<OperationPermission>(
    DEFAULT_ENTITY_PERMISSION
  );

  const fetchPermissions = useCallback(async () => {
    try {
      const perms = await getEntityPermissionByFqn(
        ResourceEntity.INSTANCE_CODE,
        instanceCodeFqn
      );
      setPermissions(perms);
    } catch {
      showErrorToast(
        t('server.fetch-entity-permissions-error', {
          entity: instanceCodeFqn,
        })
      );
    }
  }, [instanceCodeFqn, getEntityPermissionByFqn, t]);

  const fetchInstanceCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getInstanceCodeByFqn(instanceCodeFqn);
      setCodeGroup(res.codeGroup);
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
            entityType: t('label.instance-code'),
            entityName: instanceCodeFqn,
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [instanceCodeFqn, navigate, t]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (getPrioritizedViewPermission(permissions, Operation.ViewBasic)) {
      fetchInstanceCode();
    }
  }, [permissions, fetchInstanceCode]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorPlaceHolder>
        {getEntityMissingError('instanceCode', instanceCodeFqn)}
      </ErrorPlaceHolder>
    );
  }

  if (!permissions.ViewAll && !permissions.ViewBasic) {
    return (
      <ErrorPlaceHolder
        className="border-none"
        permissionValue={t('label.view-entity', {
          entity: t('label.instance-code'),
        })}
        type={ERROR_PLACEHOLDER_TYPE.PERMISSION}
      />
    );
  }

  return <Navigate replace to={getInstanceCodeGroupPath(codeGroup ?? '')} />;
};

export default InstanceCodeDetailsPage;
