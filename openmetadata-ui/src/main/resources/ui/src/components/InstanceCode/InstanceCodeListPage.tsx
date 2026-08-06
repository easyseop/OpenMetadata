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
import { Code01 } from '@untitledui/icons';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ERROR_PLACEHOLDER_TYPE } from '../../enums/common.enum';
import { InstanceCode } from '../../generated/entity/data/instanceCode';
import { withPageLayout } from '../../hoc/withPageLayout';
import { getInstanceCodes } from '../../rest/instanceCodeAPI';
import { getInstanceCodeGroupPath } from '../../utils/RouterUtils';
import { showErrorToast } from '../../utils/ToastUtils';
import { useBreadcrumbs } from '../common/atoms/navigation/useBreadcrumbs';
import { usePageHeader } from '../common/atoms/navigation/usePageHeader';
import { useTitleAndCount } from '../common/atoms/navigation/useTitleAndCount';
import ErrorPlaceHolder from '../common/ErrorWithPlaceholder/ErrorPlaceHolder';
import Loader from '../common/Loader/Loader';

interface InstanceCodeGroup {
  codeGroup: string;
  codeGroupName?: string;
  count: number;
}

const groupInstanceCodes = (instanceCodes: InstanceCode[]) => {
  const groupMap = new Map<string, InstanceCodeGroup>();

  instanceCodes.forEach((instanceCode) => {
    const existing = groupMap.get(instanceCode.codeGroup);
    if (existing) {
      existing.count += 1;
      existing.codeGroupName =
        existing.codeGroupName ?? instanceCode.codeGroupName;
    } else {
      groupMap.set(instanceCode.codeGroup, {
        codeGroup: instanceCode.codeGroup,
        codeGroupName: instanceCode.codeGroupName,
        count: 1,
      });
    }
  });

  return Array.from(groupMap.values()).sort((a, b) =>
    a.codeGroup.localeCompare(b.codeGroup)
  );
};

const InstanceCodeListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [instanceCodes, setInstanceCodes] = useState<InstanceCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstanceCodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInstanceCodes({ limit: 200 });
      setInstanceCodes(response.data);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstanceCodes();
  }, [fetchInstanceCodes]);

  const groups = useMemo(
    () => groupInstanceCodes(instanceCodes),
    [instanceCodes]
  );

  const { breadcrumbs } = useBreadcrumbs({
    items: [{ name: t('label.instance-code-plural'), url: '', isActive: true }],
  });

  const { pageHeader } = usePageHeader({
    titleKey: 'label.instance-code-plural',
    descriptionMessageKey: 'message.instance-code-description',
    createPermission: false,
  });

  const { titleAndCount } = useTitleAndCount({
    titleKey: 'label.code-group',
    count: groups.length,
    loading,
  });

  const handleGroupClick = useCallback(
    (codeGroup: string) => {
      navigate(getInstanceCodeGroupPath(codeGroup));
    },
    [navigate]
  );

  const content = useMemo(() => {
    if (loading) {
      return <Loader />;
    }

    if (groups.length === 0) {
      return (
        <ErrorPlaceHolder
          className="border-none"
          heading={t('message.no-data-message', {
            entity: t('label.instance-code-lowercase-plural'),
          })}
          type={ERROR_PLACEHOLDER_TYPE.NO_DATA}
        />
      );
    }

    return (
      <Box className="tw:grid tw:grid-cols-1 tw:gap-4 tw:px-6 tw:py-5 tw:md:grid-cols-2 tw:lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            isClickable
            key={group.codeGroup}
            style={{ padding: 20 }}
            variant="elevated"
            onClick={() => handleGroupClick(group.codeGroup)}>
            <Box direction="col" gap={4}>
              <Box align="center" direction="row" justify="between">
                <FeaturedIcon
                  color="brand"
                  icon={Code01}
                  size="md"
                  theme="light"
                />
                <Badge color="gray" size="sm">
                  {group.count}
                </Badge>
              </Box>
              <Box direction="col" gap={1}>
                <Typography size="text-md" weight="semibold">
                  {group.codeGroupName || group.codeGroup}
                </Typography>
                <Typography
                  className="tw:text-tertiary tw:font-mono"
                  size="text-xs">
                  {group.codeGroup}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }, [loading, groups, handleGroupClick, t]);

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

export { InstanceCodeListPage };

export default withPageLayout(InstanceCodeListPage);
