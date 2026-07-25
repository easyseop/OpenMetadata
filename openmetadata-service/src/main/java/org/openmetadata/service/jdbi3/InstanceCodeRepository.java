/*
 *  Copyright 2021 Collate
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
package org.openmetadata.service.jdbi3;

import static org.openmetadata.common.utils.CommonUtil.nullOrEmpty;

import lombok.extern.slf4j.Slf4j;
import org.openmetadata.schema.entity.data.InstanceCode;
import org.openmetadata.schema.type.change.ChangeSource;
import org.openmetadata.service.Entity;
import org.openmetadata.service.resources.instancecode.InstanceCodeResource;
import org.openmetadata.service.util.EntityUtil;
import org.openmetadata.service.util.EntityUtil.RelationIncludes;

@Slf4j
public class InstanceCodeRepository extends EntityRepository<InstanceCode> {
  public InstanceCodeRepository() {
    super(
        InstanceCodeResource.COLLECTION_PATH,
        Entity.INSTANCE_CODE,
        InstanceCode.class,
        Entity.getCollectionDAO().instanceCodeDAO(),
        "",
        "");
    supportsSearch = true;
    renameAllowed = true;
  }

  @Override
  public void setFullyQualifiedName(InstanceCode instanceCode) {
    instanceCode.setFullyQualifiedName(instanceCode.getName());
  }

  @Override
  public void prepare(InstanceCode instanceCode, boolean update) {
    if (nullOrEmpty(instanceCode.getCodeGroup())) {
      throw new IllegalArgumentException("codeGroup is required for an InstanceCode");
    }
    if (nullOrEmpty(instanceCode.getCodeValue())) {
      throw new IllegalArgumentException("codeValue is required for an InstanceCode");
    }
  }

  @Override
  public void setFields(
      InstanceCode instanceCode, EntityUtil.Fields fields, RelationIncludes relationIncludes) {
    // No relationship-backed fields to fetch.
  }

  @Override
  protected void clearFields(InstanceCode instanceCode, EntityUtil.Fields fields) {
    // No relationship-backed fields to clear.
  }

  @Override
  public void storeEntity(InstanceCode instanceCode, boolean update) {
    store(instanceCode, update);
  }

  @Override
  public void storeRelationships(InstanceCode instanceCode) {
    // InstanceCode has no relationships to other entities.
  }

  @Override
  public EntityRepository<InstanceCode>.EntityUpdater getUpdater(
      InstanceCode original, InstanceCode updated, Operation operation, ChangeSource changeSource) {
    return new InstanceCodeUpdater(original, updated, operation);
  }

  public class InstanceCodeUpdater extends EntityUpdater {
    public InstanceCodeUpdater(InstanceCode original, InstanceCode updated, Operation operation) {
      super(original, updated, operation);
    }

    @Override
    public void entitySpecificUpdate(boolean consolidatingChanges) {
      compareAndUpdate(
          "codeGroup",
          () -> recordChange("codeGroup", original.getCodeGroup(), updated.getCodeGroup()));
      compareAndUpdate(
          "codeGroupName",
          () ->
              recordChange(
                  "codeGroupName", original.getCodeGroupName(), updated.getCodeGroupName()));
      compareAndUpdate(
          "codeValue",
          () -> recordChange("codeValue", original.getCodeValue(), updated.getCodeValue()));
      compareAndUpdate(
          "codeName",
          () -> recordChange("codeName", original.getCodeName(), updated.getCodeName()));
      compareAndUpdate(
          "sortOrder",
          () -> recordChange("sortOrder", original.getSortOrder(), updated.getSortOrder()));
      compareAndUpdate(
          "registeredDate",
          () ->
              recordChange(
                  "registeredDate", original.getRegisteredDate(), updated.getRegisteredDate()));
      compareAndUpdate(
          "active", () -> recordChange("active", original.getActive(), updated.getActive()));
    }
  }
}
