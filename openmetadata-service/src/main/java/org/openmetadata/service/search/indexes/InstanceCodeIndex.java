package org.openmetadata.service.search.indexes;

import java.util.Map;
import org.openmetadata.schema.entity.data.InstanceCode;
import org.openmetadata.service.Entity;

public class InstanceCodeIndex implements TaggableIndex, LineageIndex {
  final InstanceCode instanceCode;

  public InstanceCodeIndex(InstanceCode instanceCode) {
    this.instanceCode = instanceCode;
  }

  @Override
  public Object getEntity() {
    return instanceCode;
  }

  @Override
  public String getEntityTypeName() {
    return Entity.INSTANCE_CODE;
  }

  public Map<String, Object> buildSearchIndexDocInternal(Map<String, Object> doc) {
    doc.put("codeGroup", instanceCode.getCodeGroup());
    doc.put("codeGroupName", instanceCode.getCodeGroupName());
    doc.put("codeValue", instanceCode.getCodeValue());
    doc.put("codeName", instanceCode.getCodeName());
    doc.put("sortOrder", instanceCode.getSortOrder());
    doc.put("registeredDate", instanceCode.getRegisteredDate());
    doc.put("active", instanceCode.getActive());
    return doc;
  }

  public static Map<String, Float> getFields() {
    Map<String, Float> fields = SearchIndex.getDefaultFields();
    fields.put("codeGroup", 5.0f);
    fields.put("codeValue", 5.0f);
    fields.put("codeName", 3.0f);
    return fields;
  }
}
