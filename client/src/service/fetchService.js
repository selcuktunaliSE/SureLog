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
    TenantNotFound: "TenantNotFound",
    RoleNotFound: "RoleNotFound",
    ServerException: "ServerException",
    FetchError: "FetchError",
    ResourceNotFound: "ResourceNotFound",
}

const deleteUserFromTenant = async (tenantId, userId) => {
  try {
      const response = await fetch(`${fetchAddress}/api/delete-tenant-user`, {
          method: 'post',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tenantId, userId })
      });

      return await response.json();
  } catch (error) {
      console.error("Error in deleteUserFromTenant service: ", error);
      return { status: "error", message: "Error deleting user from tenant" };
  }
};
const fetchUsersFromTenant = async (tenantId) => {
  let fetchResponse;
  try {
    const response = await fetch(`${fetchAddress}/api/fetch-tenant-users`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenantId: tenantId })
    });

    const data = await response.json();

    if (data.status === "success") {
      // Map users data and combine firstName and lastName into Name
      const remappedUsers = data.users.map(user => ({
        Id:`${user.userId}`,
        Name: `${user.firstName} ${user.lastName}`,
        Email:`${user.email}`
      }));

      // Update the fetchResponse with the remapped users
      fetchResponse = new FetchResponse(FetchStatus.Success, { users: remappedUsers });
    } else {
      // Handle different error statuses accordingly
      fetchResponse = new FetchResponse(FetchStatus.Error, null, data.message);
    }
  } catch (error) {
    console.error("Error fetching users from tenant:", error);
    fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};



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
const registerUser = async (userData) => {
  const response = await fetch(`${fetchAddress}/api/register-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

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

const fetchTenantUsers = async (userId, tenantId,roleName) => {
  let fetchResponse;
  await fetch(`${fetchAddress}/api/fetch-users`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      tenantId: tenantId,
      roleName: roleName
    })
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, {users: data.users});
      } else if (data.status === "accessDenied") {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      } else if (data.status === 503) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      } else if (data.status === "roleNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}


const fetchUserProfile = async (sourceUserId, targetUserId) => {
  let fetchResponse;
  const requestData = {
    sourceUserId: sourceUserId,
    targetUserId: targetUserId,
  };

  await fetch(`${fetchAddress}/api/fetch-user-profile`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, {user: data.user});
      } 
      else if(data.status === "accessDenied"){
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
      else if(data.status === "userNotFound"){
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
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
  
const fetchTenantProfile = async(userId, tenantId) => {
  let fetchResponse;
  const requestData = {
    userId: userId,
    tenantId: tenantId,
  }

  console.log(`Fetching tenant profile with ID:${tenantId} for user with ID:${userId}`);

  await fetch(`${fetchAddress}/api/fetch-tenant-profile`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    },
  }).then((response) => response.json())
  .then((data) => {
    if(data.status === "success"){
      fetchResponse = new FetchResponse(FetchStatus.Success, {tenant: data.tenant});
    }
    else if(data.status === 404){
      fetchResponse = new FetchResponse(FetchStatus.TenantNotFound);
    }
    else if(data.status === 500){
      fetchResponse = new FetchResponse(FetchStatus.ServerException);
    }
    else if(data.status === 505){
      fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
    }
  })
  .catch((error) => {
    fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
  });
  
  return fetchResponse;
}


export {
    FetchStatus,
    fetchUsersFromTenant,
    fetchTenantRoles,
    fetchTenants,
    fetchUserProfile,
    fetchTenantProfile,
    fetchTenantUsers,
    checkMasterUser,
    registerUser,
    deleteUserFromTenant
}