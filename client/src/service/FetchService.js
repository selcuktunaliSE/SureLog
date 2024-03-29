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
const fetchAllMasters = async () => {
  let fetchResponse = new FetchResponse();
  try {
      const response = await fetch(`${fetchAddress}/api/fetch-all-masters`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
      });

      const data = await response.json();
      if (response.ok) {
          fetchResponse = new FetchResponse(FetchStatus.Success, data);
      } else {
          const errorMessage = data.message || "Failed to fetch masters";
          fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
      }
  } catch (error) {
      console.error('Error fetching masters:', error);
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};
const updateMaster = async (masterData) => {
  let fetchResponse = new FetchResponse();
  try {
      const response = await fetch(`${fetchAddress}/api/update-master`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(masterData),
      });

      const data = await response.json();
      if (response.ok) {
          fetchResponse = new FetchResponse(FetchStatus.Success, data);
      } else {
          const errorMessage = data.message || "Failed to update master";
          fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
      }
  } catch (error) {
      console.error('Error updating master:', error);
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};

const fetchAllUsersLastLogin = async () => {
  let fetchResponse = new FetchResponse();
  try {
      const response = await fetch(`${fetchAddress}/api/fetch-all-users-last-login`, {
          method: 'POST', // or 'POST' if you want to send some data like authentication token
          headers: {
              'Content-Type': 'application/json'
          },
      });

      const data = await response.json();
      if (response.ok) {
          fetchResponse = new FetchResponse(FetchStatus.Success, data);
      } else {
          const errorMessage = data.message || "Failed to fetch all users' last login information";
          fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
      }
  } catch (error) {
      console.error('Error fetching all users\' last login information:', error);
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};


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

const deleteTenantRole = async (sourceUserId, tenantId, tenantRoleId) => {
  let fetchResponse = new FetchResponse();
  await fetch(`${fetchAddress}/api/delete-tenant-role`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sourceUserId, tenantId, tenantRoleId })
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success);
      }
      else if (data.status === 505) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
      }
      else if (data.status === 500) {
        fetchResponse = new FetchResponse(FetchStatus.ServerException);
      }
    })
  return fetchResponse;
};

const editTenantName = async (sourceUserId, tenantId, newTenantName) => {
  const updatedTenantData = {
    name: newTenantName // assuming the tenant's name field is 'name'
  };

  const response = await fetch(`${fetchAddress}/api/update-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceUserId, tenantId, updatedTenantData }),
  });

  const data = await response.json();
  
  // Handle different response types
  let fetchResponse;
  if (data.status === "success") {
    fetchResponse = new FetchResponse(FetchStatus.Success, data, 'Tenant name updated successfully.');
  } else if (data.status === "tenantNotFound") {
    fetchResponse = new FetchResponse(FetchStatus.TenantNotFound, null, 'Tenant not found.');
  } else if (data.status === "accessDenied") {
    fetchResponse = new FetchResponse(FetchStatus.AccessDenied, null, 'Access denied.');
  } else {
    fetchResponse = new FetchResponse(FetchStatus.Error, null, data.message || 'An error occurred while updating the tenant name.');
  }

  return fetchResponse;
};
const fetchUserRoleName = async (userId) => {
  let fetchResponse = new FetchResponse();
  try {
    const response = await fetch(`${fetchAddress}/api/get-user-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    const data = await response.json();
  

    if (response.ok) {
      // Handle success
      fetchResponse = new FetchResponse(FetchStatus.Success, data.roleName);
    } else {
      // Handle server-side errors
      const errorMessage = data.message || "Failed to fetch user role name";
      fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
    }
  } catch (error) {
    // Handle errors in the fetch operation itself
    console.error('Error fetching user role name:', error);
    fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

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
const logout = async (userId) => {
  let fetchResponse = new FetchResponse();
  try {
    const response = await fetch(`${fetchAddress}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }), // assuming you want to send the userId in the body
    });
    console.log("Response in fetch service: ", response);
    const data = await response.json();
    if (response.ok) {
      fetchResponse = new FetchResponse(FetchStatus.Success, data);
    
    } else {
      const errorMessage = data.message || "Logout failed";
      fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
    }
  } catch (error) {
    console.error('Error during logout:', error);
    fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};


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
const getActivities = async () => {
  let fetchResponse = new FetchResponse();
  try {
      const response = await fetch(`${fetchAddress}/api/get-activities`, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json'
          }
      });

      const data = await response.json();
      if (data.status ==="success") {
          fetchResponse = new FetchResponse(FetchStatus.Success, data);
      } else {
          const errorMessage = data.message || "Failed to fetch activities";
          fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
      }
  } catch (error) {
      console.error('Error fetching activities:', error);
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};
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
    console.log("Feetching response", fetchResponse);
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
const fetchMasterRoles = async () => {
  let fetchResponse = new FetchResponse();
  try {
      const response = await fetch(`${fetchAddress}/api/fetch-master-roles`, {
          method: 'POST', // Assuming it's a GET request
          headers: {
              'Content-Type': 'application/json'
          },
      });

      const data = await response.json();
      if (response.ok) {
          fetchResponse = new FetchResponse(FetchStatus.Success, data);
      } else {
          const errorMessage = data.message || "Failed to fetch master roles";
          fetchResponse = new FetchResponse(FetchStatus.Error, null, errorMessage);
      }
  } catch (error) {
      console.error('Error fetching master roles:', error);
      fetchResponse = new FetchResponse(FetchStatus.FetchError, null, error.message);
  }

  return fetchResponse;
};

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
      data.message,
  );
};

const updateTenantRole = async(sourceUserId, tenantRoleId, tenantRoleData) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId,
    tenantRoleId: tenantRoleId,
    tenantRoleData: tenantRoleData
  };

  console.log(`Updating tenant role data for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/update-tenant-role`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success);
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.RoleNotFound);
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


const addTenant = async (sourceUserId, tenantData) => {
  const response = await fetch(`${fetchAddress}/api/add-tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sourceUserId, tenantData })
  });
  return response.json(); 
};

const addTenantRole = async(sourceUserId, tenantRoleData) => {
  let fetchResponse = new FetchResponse();
  await fetch(`${fetchAddress}/api/add-tenant-role`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceUserId, sourceUserId,
      tenantRoleData: tenantRoleData
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success);
      }
      else if (data.status === 404) {
        fetchResponse = new FetchResponse(FetchStatus.AccessDenied);
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

const deleteTenant = async (sourceUserId, tenantId) => {
  const response = await fetch(`${fetchAddress}/api/delete-tenant`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sourceUserId, tenantId })
});

  

  const data = await response.json();
  
  // Handle different response types
  if (data.status === "success") {
      return new FetchResponse(FetchStatus.Success);
  } else if (data.status === "tenantNotFound") {
      return new FetchResponse(FetchStatus.TenantNotFound);
  } else if (data.status === "accessDenied") {
      return new FetchResponse(FetchStatus.AccessDenied);
  } else {
      return new FetchResponse(FetchStatus.Error, null, data.message || 'An error occurred while deleting the tenant.');
  }
};


const fetchUserTypeCountDistributionData = async (sourceUserId) => {
  let fetchResponse = new FetchResponse();
  const requestData = {
    sourceUserId: sourceUserId
  };

  console.log(`Fetching user type distribution data for Source User ID:${sourceUserId}`);

  await fetch(`${fetchAddress}/api/fetch-user-type-count-distribution-data`, {
    method: "post",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json"
    }
  }).then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        fetchResponse = new FetchResponse(FetchStatus.Success, { userTypeCountDistributionData: data.userTypeCountDistributionData });
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
  fetchUserTypeCountDistributionData,
  fetchGenerateQRCode,
  fetchVerifyToken,
  updateTenant,
  updateUser,
  updateTenantRole,
  fetchUserRole,
  addTenant,
  addTenantRole,
  deleteTenant,
  deleteTenantRole,
  editTenantName,
  fetchUserRoleName,
  fetchAllUsersLastLogin,
  fetchAllMasters,
  fetchMasterRoles,
  updateMaster,
  logout,
  getActivities
}
