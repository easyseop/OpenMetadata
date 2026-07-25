package org.openmetadata.service.resources.instancecode;

import org.openmetadata.schema.api.data.CreateInstanceCode;
import org.openmetadata.schema.entity.data.InstanceCode;
import org.openmetadata.service.mapper.EntityMapper;

public class InstanceCodeMapper implements EntityMapper<InstanceCode, CreateInstanceCode> {
  @Override
  public InstanceCode createToEntity(CreateInstanceCode create, String user) {
    return copy(new InstanceCode(), create, user)
        .withCodeGroup(create.getCodeGroup())
        .withCodeGroupName(create.getCodeGroupName())
        .withCodeValue(create.getCodeValue())
        .withCodeName(create.getCodeName())
        .withSortOrder(create.getSortOrder())
        .withRegisteredDate(create.getRegisteredDate())
        .withActive(create.getActive() == null ? Boolean.TRUE : create.getActive());
  }
}
