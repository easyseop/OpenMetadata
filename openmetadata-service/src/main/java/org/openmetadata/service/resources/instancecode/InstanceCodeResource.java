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
package org.openmetadata.service.resources.instancecode;

import io.swagger.v3.oas.annotations.ExternalDocumentation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.json.JsonPatch;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.openmetadata.schema.api.VoteRequest;
import org.openmetadata.schema.api.data.CreateInstanceCode;
import org.openmetadata.schema.api.data.RestoreEntity;
import org.openmetadata.schema.entity.data.InstanceCode;
import org.openmetadata.schema.type.ChangeEvent;
import org.openmetadata.schema.type.EntityHistory;
import org.openmetadata.schema.type.Include;
import org.openmetadata.schema.type.MetadataOperation;
import org.openmetadata.schema.utils.ResultList;
import org.openmetadata.service.Entity;
import org.openmetadata.service.jdbi3.InstanceCodeRepository;
import org.openmetadata.service.jdbi3.ListFilter;
import org.openmetadata.service.limits.Limits;
import org.openmetadata.service.resources.Collection;
import org.openmetadata.service.resources.EntityResource;
import org.openmetadata.service.security.Authorizer;

@Path("/v1/instanceCodes")
@Tag(
    name = "InstanceCodes",
    description = "`InstanceCode`s are common/reference code entries shared as master data.")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Collection(name = "instanceCodes")
public class InstanceCodeResource extends EntityResource<InstanceCode, InstanceCodeRepository> {
  public static final String COLLECTION_PATH = "/v1/instanceCodes/";
  private final InstanceCodeMapper mapper = new InstanceCodeMapper();
  static final String FIELDS = "owners,followers,tags,domains,dataProducts,extension";

  public InstanceCodeResource(Authorizer authorizer, Limits limits) {
    super(Entity.INSTANCE_CODE, authorizer, limits);
  }

  @Override
  protected List<MetadataOperation> getEntitySpecificOperations() {
    return Collections.emptyList();
  }

  public static class InstanceCodeList extends ResultList<InstanceCode> {
    /* Required for serde */
  }

  @GET
  @Operation(
      operationId = "listInstanceCodes",
      summary = "List InstanceCodes",
      description =
          "Get a list of InstanceCodes. Use `fields` parameter to get only necessary fields.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "List of InstanceCodes",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCodeList.class)))
      })
  public ResultList<InstanceCode> list(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @DefaultValue("10") @QueryParam("limit") int limitParam,
      @Parameter(
              description = "Returns list of InstanceCodes before this cursor",
              schema = @Schema(type = "string"))
          @QueryParam("before")
          String before,
      @Parameter(
              description = "Returns list of InstanceCodes after this cursor",
              schema = @Schema(type = "string"))
          @QueryParam("after")
          String after,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include) {
    ListFilter filter = new ListFilter(include);
    return super.listInternal(
        uriInfo, securityContext, fieldsParam, filter, limitParam, before, after);
  }

  @GET
  @Path("/{id}")
  @Operation(
      operationId = "getInstanceCodeByID",
      summary = "Get an InstanceCode by Id",
      description = "Get an InstanceCode by `Id`.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The InstanceCode",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class))),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {id} is not found")
      })
  public InstanceCode get(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include) {
    return getInternal(uriInfo, securityContext, id, fieldsParam, include, null);
  }

  @GET
  @Path("/name/{fqn}")
  @Operation(
      operationId = "getInstanceCodeByFQN",
      summary = "Get an InstanceCode by fully qualified name.",
      description = "Get an InstanceCode by fully qualified name.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The InstanceCode",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class))),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {fqn} is not found")
      })
  public InstanceCode getByName(
      @Context UriInfo uriInfo,
      @Parameter(
              description = "Fully qualified name of the InstanceCode",
              schema = @Schema(type = "string"))
          @PathParam("fqn")
          String fqn,
      @Context SecurityContext securityContext,
      @Parameter(
              description = "Fields requested in the returned resource",
              schema = @Schema(type = "string", example = FIELDS))
          @QueryParam("fields")
          String fieldsParam,
      @Parameter(
              description = "Include all, deleted, or non-deleted entities.",
              schema = @Schema(implementation = Include.class))
          @QueryParam("include")
          @DefaultValue("non-deleted")
          Include include) {
    return getByNameInternal(uriInfo, securityContext, fqn, fieldsParam, include, null);
  }

  @GET
  @Path("/{id}/versions")
  @Operation(
      operationId = "listAllInstanceCodeVersion",
      summary = "List InstanceCode versions",
      description = "Get a list of all the versions of an InstanceCode identified by `id`",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "List of InstanceCode versions",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = EntityHistory.class)))
      })
  public EntityHistory listVersions(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id) {
    return super.listVersionsInternal(securityContext, id);
  }

  @GET
  @Path("/{id}/versions/{version}")
  @Operation(
      operationId = "getSpecificInstanceCodeVersion",
      summary = "Get a version of the InstanceCode",
      description = "Get a version of the InstanceCode by given `id`",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "InstanceCode Version",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class))),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {id} and version {version} is not found")
      })
  public InstanceCode getVersion(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id,
      @Parameter(
              description = "InstanceCode version number in the form `major`.`minor`",
              schema = @Schema(type = "string", example = "0.1 or 1.1"))
          @PathParam("version")
          String version) {
    return super.getVersionInternal(securityContext, id, version);
  }

  @POST
  @Operation(
      operationId = "createInstanceCode",
      summary = "Create an InstanceCode",
      description = "Create a new InstanceCode.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The InstanceCode",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class))),
        @ApiResponse(responseCode = "400", description = "Bad request")
      })
  public Response create(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Valid CreateInstanceCode create) {
    InstanceCode instanceCode =
        mapper.createToEntity(create, securityContext.getUserPrincipal().getName());
    return create(uriInfo, securityContext, instanceCode);
  }

  @PUT
  @Operation(
      operationId = "createOrUpdateInstanceCode",
      summary = "Create or update an InstanceCode",
      description =
          "Create a new InstanceCode, if it does not exist or update an existing InstanceCode.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "The InstanceCode",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class))),
        @ApiResponse(responseCode = "400", description = "Bad request")
      })
  public Response createOrUpdate(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Valid CreateInstanceCode create) {
    InstanceCode instanceCode =
        mapper.createToEntity(create, securityContext.getUserPrincipal().getName());
    return createOrUpdate(uriInfo, securityContext, instanceCode);
  }

  @PATCH
  @Path("/{id}")
  @Operation(
      operationId = "patchInstanceCode",
      summary = "Update an InstanceCode",
      description = "Update an existing InstanceCode using JsonPatch.",
      externalDocs =
          @ExternalDocumentation(
              description = "JsonPatch RFC",
              url = "https://tools.ietf.org/html/rfc6902"))
  @Consumes(MediaType.APPLICATION_JSON_PATCH_JSON)
  public Response patchInstanceCode(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id,
      @RequestBody(
              description = "JsonPatch with array of operations",
              content = @Content(mediaType = MediaType.APPLICATION_JSON_PATCH_JSON))
          JsonPatch patch) {
    return patchInternal(uriInfo, securityContext, id, patch);
  }

  @PATCH
  @Path("/name/{fqn}")
  @Operation(
      operationId = "patchInstanceCodeByFqn",
      summary = "Update an InstanceCode using name.",
      description = "Update an existing InstanceCode using JsonPatch.",
      externalDocs =
          @ExternalDocumentation(
              description = "JsonPatch RFC",
              url = "https://tools.ietf.org/html/rfc6902"))
  @Consumes(MediaType.APPLICATION_JSON_PATCH_JSON)
  public Response patchInstanceCode(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Name of the InstanceCode", schema = @Schema(type = "string"))
          @PathParam("fqn")
          String fqn,
      @RequestBody(
              description = "JsonPatch with array of operations",
              content = @Content(mediaType = MediaType.APPLICATION_JSON_PATCH_JSON))
          JsonPatch patch) {
    return patchInternal(uriInfo, securityContext, fqn, patch);
  }

  @PUT
  @Path("/{id}/followers")
  @Operation(
      operationId = "addFollowerToInstanceCode",
      summary = "Add a follower",
      description = "Add a user identified by `userId` as follower of this InstanceCode.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ChangeEvent.class))),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {id} is not found")
      })
  public Response addFollower(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id,
      @Parameter(
              description = "Id of the user to be added as follower",
              schema = @Schema(type = "UUID"))
          UUID userId) {
    return repository
        .addFollower(securityContext.getUserPrincipal().getName(), id, userId)
        .toResponse();
  }

  @DELETE
  @Path("/{id}/followers/{userId}")
  @Operation(
      summary = "Remove a follower",
      description = "Remove the user identified `userId` as a follower of the InstanceCode.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ChangeEvent.class)))
      })
  public Response deleteFollower(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id,
      @Parameter(
              description = "Id of the user being removed as follower",
              schema = @Schema(type = "string"))
          @PathParam("userId")
          String userId) {
    return repository
        .deleteFollower(securityContext.getUserPrincipal().getName(), id, UUID.fromString(userId))
        .toResponse();
  }

  @PUT
  @Path("/{id}/vote")
  @Operation(
      operationId = "updateVoteForInstanceCode",
      summary = "Update Vote for an InstanceCode",
      description = "Update vote for an InstanceCode",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "OK",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ChangeEvent.class))),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {id} is not found")
      })
  public Response updateVote(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Id of the Entity", schema = @Schema(type = "UUID")) @PathParam("id")
          UUID id,
      @Valid VoteRequest request) {
    return repository
        .updateVote(securityContext.getUserPrincipal().getName(), id, request)
        .toResponse();
  }

  @DELETE
  @Path("/{id}")
  @Operation(
      operationId = "deleteInstanceCode",
      summary = "Delete an InstanceCode by id",
      description = "Delete an InstanceCode by `id`.",
      responses = {
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {id} is not found")
      })
  public Response delete(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Hard delete the entity. (Default = `false`)")
          @QueryParam("hardDelete")
          @DefaultValue("false")
          boolean hardDelete,
      @Parameter(description = "Id of the InstanceCode", schema = @Schema(type = "UUID"))
          @PathParam("id")
          UUID id) {
    return delete(uriInfo, securityContext, id, false, hardDelete);
  }

  @DELETE
  @Path("/name/{fqn}")
  @Operation(
      operationId = "deleteInstanceCodeByFQN",
      summary = "Delete an InstanceCode by fully qualified name",
      description = "Delete an InstanceCode by `fullyQualifiedName`.",
      responses = {
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(
            responseCode = "404",
            description = "InstanceCode for instance {fqn} is not found")
      })
  public Response delete(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Parameter(description = "Hard delete the entity. (Default = `false`)")
          @QueryParam("hardDelete")
          @DefaultValue("false")
          boolean hardDelete,
      @Parameter(
              description = "Fully qualified name of the InstanceCode",
              schema = @Schema(type = "string"))
          @PathParam("fqn")
          String fqn) {
    return deleteByName(uriInfo, securityContext, fqn, false, hardDelete);
  }

  @PUT
  @Path("/restore")
  @Operation(
      operationId = "restoreInstanceCode",
      summary = "Restore a soft deleted InstanceCode.",
      description = "Restore a soft deleted InstanceCode.",
      responses = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully restored the InstanceCode.",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = InstanceCode.class)))
      })
  public Response restore(
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Valid RestoreEntity restore) {
    return restoreEntity(uriInfo, securityContext, restore.getId());
  }
}
