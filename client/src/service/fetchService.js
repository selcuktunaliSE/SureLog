const fetchConfig = require("../config/fetchConfig.json");

const fetchAddress = `http://${fetchConfig.host}:${fetchConfig.port}`;

class FetchResponse {
    constructor(fetchStatus, data=null, message=null){
        this.status = fetchStatus;
        this.data = data;
        this.message = message;
    }

    isError(){
        return this.status !== FetchStatus.Success;
    }
}

const FetchStatus = {
    Success: "Success",
    Error: "Error",
    AccessDenied: "AccessDenied",
    UserNotFound: "UserNotFound",
    MasterNotFound: "MasterNotFound",
    RoleNotFound: "RoleNotFound",
    ServerException: "ServerException",
    FetchError: "FetchError",
    ResourceNotFound: "ResourceNotFound",
}


const fetchUsersFromTenant = async (userId, tenantId, tenantRoles) => {
  let fetchResponse;
  await fetch(`${fetchAddress}/api/fetch-users`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId, 
      tenantId: tenantId,
      roleName: tenantRoles[tenantId],
    })
  }).then((response) => response.json())
    .then((data) => {
      if(data.status === "success" && data.users){
          fetchResponse = new FetchResponse(FetchStatus.Success, {users: data.users});
      } else if(data.status === "roleNotFound" || data.status === 505) {
          fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
      }else if(data.status === "accessDenied"){
          fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
        
      }
      else if(data.status === 503){
          fetchResponse = new FetchResponse(FetchStatus.ServerException) ;
      } 

    })
    .catch(error => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });
  return fetchResponse;
}

const fetchTenantRoles = async (userId) => {
  let fetchResponse;
  await fetch(`${fetchAddress}/api/fetch-tenant-roles`, {
      method: "post",
      body: JSON.stringify({
        "userId": userId
      }),
      headers: {
        "Content-Type": "application/json",
      }
  }).then((response) => response.json())
      .then((data) => {
          if(data.status === "success"){
              fetchResponse = new FetchResponse(FetchStatus.Success, {
                  tenantRoles: data.tenantRoles,
                  tenantNames: data.tenantNames});
          }
          if(data.status === 404){
              fetchResponse = new FetchResponse(FetchStatus.ResourceNotFound);
      }
          if(data.status === 500){
              fetchResponse = new FetchResponse(FetchStatus.ServerException);
          }
      })
      .catch(error => { 
          fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
      });
    return fetchResponse;
}

const fetchTenants = async (userId) => {
  let fetchResponse;
  await fetch(`${fetchAddress}/api/fetch-tenants`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, {tenants: data.tenants});
      } 
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
        
      } 
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === "roleNotFound"){
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
        }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });
  return fetchResponse;
}

const checkMasterUser = async (userId) => {
  let fetchResponse;  
  await fetch(`${fetchAddress}/api/check-master-user`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          fetchResponse = new FetchResponse(FetchStatus.Success, {isMaster: true}); 
        } 
        else if (data.status === "userIdNotFound"){
          fetchResponse = new FetchResponse(FetchStatus.UserNotFound);  
        } 
        else if(data.status ===  "masterNotFound"){
          fetchResponse = new FetchResponse(FetchStatus.MasterNotFound);  
        } 
        else if(data.status === 500){
          fetchResponse = new FetchResponse(FetchStatus.ServerException);  
        }
      })
      .catch((error) => {
        fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
      });
  return fetchResponse;
}

/* const getUserProfile = async (userId, targetUserId, tenantId) => {
    const senderUserId = localStorage.getItem("userId"); 
    const tenantId = selectedTenantId; 
  
    const requestData = {
      senderUserId: senderUserId,
      targetUserId: targetUserId,
      tenantId: tenantId,
    };
  
    await fetch(`${fetchAddress}/api/go-to-user-profile`, {
      method: "post",
      body: JSON.stringify(requestData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
            return new FetchResponse(FetchStatus.Success)
          navigate(`/profile?userId=${targetUserId}`);
        } else {
        }
      })
      .catch((error) => {
        return new FetchResponse(FetchStatus.FetchError, null, error);
      });
} */


export {
    FetchStatus,
    fetchUsersFromTenant,
    fetchTenantRoles,
    fetchTenants,
    checkMasterUser,
}