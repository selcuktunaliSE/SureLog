const fetchConfig = require("../config/fetchConfig.json");
const fetchAddress = `http://${fetchConfig.host}:${fetchConfig.port}`;
class FetchResponse {
  constructor(fetchStatus = null, data = null, message = null) {
    this.status = fetchStatus;
    this.data = data;
    this.message = message;
  }

  isError() {
    if (!this.status) return true;
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
const fetchVerifyToken = async (token, secret) => {
  try {
    let response = await fetch(`${fetchAddress}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, secret }),
    });
    
    if (response.status === 200) {
      console.log("Token Response is successful : ", response);
      return true;
    } else {
      const errorText = await response.text(); // Get response text to see the error message from the server
      console.error('Token verification failed: ', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};


const fetchGenerateQRCode = async () => {
  try {
    const response = await fetch(`${fetchAddress}/api/generate-qrcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching QR code: ${response.statusText}`);
    }
   
    const data = await response.json();
    console.log('data: ', data);
    let fetchResponse;

    if (data.status === "success") {
      fetchResponse = new FetchResponse(FetchStatus.Success, { qrCode: data.qrCode, secret: data.secret });
    } else if (data.status === 404) {
      fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
    } else if (data.status === 500) {
      fetchResponse = new FetchResponse(FetchStatus.ServerException);
    }
    fetchResponse = data;
    console.log("fetchresponse data: ", fetchResponse);
    return fetchResponse;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    throw error; 
  }
};

const updateTenantProfile = async(tenantId,tenantData)  => {

}

const removeUserFromTenant = async (sourceUserId, tenantId, targetUserId) => {
  let fetchResponse = new FetchResponse();
  await fetch(`${fetchAddress}/api/remove-user-from-tenant`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sourceUserId, tenantId, targetUserId })
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
    })
  return fetchResponse;

};

const fetchTenantRolesOfTenant = async (sourceUserId, tenantId) => {
  let fetchResponse = new FetchResponse();
  console.log(`Sending fetch tenant roles request of tenant: ${tenantId} for source user:${sourceUserId}`);
  await fetch(`${fetchAddress}/api/fetch-tenant-roles-of-tenant`, {
    method: "post",
    body: JSON.stringify({
      sourceUserId: sourceUserId,
      tenantId: tenantId,
    }),
    headers: {
      "Content-Type": "application/json",
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { tenantRoles: data.tenantRoles });
      }
      if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.ResourceNotFound);
      }
      if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
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

const fetchTenantsOfMaster = async (userId) => {
  let fetchResponse = new FetchResponse();
  await fetch(`${fetchAddress}/api/fetch-tenants-of-master`, {
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
        fetchResponse = new FetchResponse(FetchStatus.Success, { tenants: data.tenants });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);

      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === "roleNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });
  return fetchResponse;
}

const fetchTenantOfUser = async (sourceUserId, targetUserId) => {
  let fetchResponse = new FetchResponse();
  console.log("test");
  await fetch(`${fetchAddress}/api/fetch-tenant-of-user`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceUserId: sourceUserId,
      targetUserId: targetUserId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { tenant: data.tenant });
      }
      else if (data.status === 404 || data.status === "accessDenied") {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);

      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === "roleNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
      }
      console.log("fetch server response data: ", data)
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}

const checkMasterUser = async (userId) => {
  let fetchResponse = new FetchResponse();
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
        fetchResponse = new FetchResponse(FetchStatus.Success, { isUserMaster: true });
      }
      else if (data.status === "userIdNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === "masterNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.MasterNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });
  return fetchResponse;
}

const fetchTenantUsers = async (userId, tenantId) => {
  let fetchResponse = new FetchResponse();
  await fetch(`${fetchAddress}/api/fetch-tenant-users`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      tenantId: tenantId,
    })
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { users: data.users });
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

const fetchUserRole = async (tenantId, userId) => {
  let fetchResponse = new FetchResponse();

  // Validate input
  if (!tenantId || !userId) {
    return new FetchResponse(FetchStatus.Error, null, 'Tenant ID and User ID are required.');
  }

  try {
    const response = await fetch(`${fetchAddress}/api/fetch-user-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenantId, userId }),
    });

    const data = await response.json();
    
    // Handle different response types
    if (data.status === "success") {
      fetchResponse = new FetchResponse(FetchStatus.Success, { roleName: data.roleName });
    } else if (data.status === "userNotFound" || data.status === "tenantNotFound") {
      fetchResponse = new FetchResponse(FetchStatus.ResourceNotFound);
    } else if (data.status === "accessDenied") {
      fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
    } else {
      fetchResponse = new FetchResponse(FetchStatus.Error, null, data.message || 'An error occurred while fetching the user role.');
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
}

const fetchUserProfile = async (sourceUserId, targetUserId) => {
  let fetchResponse = new FetchResponse();
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
        fetchResponse = new FetchResponse(FetchStatus.Success, { user: data.user });
      }
      else if (data.status === "accessDenied") {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
      else if (data.status === "userNotFound") {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}

const fetchTenantProfile = async (userId, tenantId) => {
  let fetchResponse = new FetchResponse();
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
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { tenant: data.tenant });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.TenantNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}

const fetchTotalNumberOfUsers = async (sourceUserId) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId
  };

  console.log(`Fetching total number of user count for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/fetch-total-number-of-users`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { totalNumberOfUsers: data.totalNumberOfUsers });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}

const fetchTotalNumberOfTenants = async (sourceUserId) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId
  };

  console.log(`Fetching total number of tenant count for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/fetch-total-number-of-tenants`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { totalNumberOfTenants: data.totalNumberOfTenants });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}

const fetchTotalNumberOfMasters = async (sourceUserId) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId
  };

  console.log(`Fetching total number of master count for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/fetch-total-number-of-masters`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { totalNumberOfMasters: data.totalNumberOfMasters });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
    })
    .catch((error) => {
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error);
    });

  return fetchResponse;
}
const updateTenant = async (sourceUserId, tenantId, updatedTenantData) => {
  console.log("updatedTenantData: ", updatedTenantData);
  const response = await fetch(`${fetchAddress}/api/update-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceUserId, tenantId, updatedTenantData }),
  });

  return response.json();
};


const updateUser = async (sourceUserId, userId, updatedUserData) => {
  const response = await fetch(`${fetchAddress}/api/update-user`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceUserId, userId, updatedUserData }),
  });

  const data = await response.json();
  console.log("Response for editing is: ", data);
  console.log("Updated User data is: ", updatedUserData);
  
  return new FetchResponse(
      data.status === "success" ? FetchStatus.Success : FetchStatus.Error,
      data,
      data.message
  );
};
const addTenant = async (sourceUserId, tenantData) => {
  const response = await fetch(`${fetchAddress}/api/add-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sourceUserId, tenantData })
  });
  return response.json(); // You can further process the response as needed
};


const fetchUserTypeDistributionData = async (sourceUserId) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId
  };

  console.log(`Fetching user type distribution data for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/fetch-user-type-distribution-data`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        console.log("data: ", data);
        fetchResponse = new FetchResponse(FetchStatus.Success, { userTypeDistributionData: data.userTypeDistributionData });
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.UserNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
      else if (data.status === 505) {
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
  fetchTenantRolesOfTenant,
  fetchTenantsOfMaster,
  fetchTenantOfUser,
  fetchUserProfile,
  fetchTenantProfile,
  fetchTenantUsers,
  checkMasterUser,
  registerUser,
  removeUserFromTenant,
  fetchTotalNumberOfUsers,
  fetchTotalNumberOfTenants,
  fetchTotalNumberOfMasters,
  fetchUserTypeDistributionData,
  fetchGenerateQRCode,
  fetchVerifyToken,
  updateTenant,
  updateUser,
  fetchUserRole,
  addTenant
}