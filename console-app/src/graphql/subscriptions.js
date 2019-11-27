/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateContract = `subscription OnCreateContract($owner: String!) {
  onCreateContract(owner: $owner) {
    id
    owner
    carrierUsername
    status
    shipper {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    carrier {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    delivery {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    arrivalDate
    deliveryDate
    pickup {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    loads {
      category
      quantity
      description
    }
    trailer
    truck
    references {
      carrier
    }
    updatedAt
    createdAt
    events {
      author {
        username
      }
      type
      site
      createdAt
      latitude
      longitude
      signature {
        method
        signatureImageDriver {
          bucket
          region
          key
        }
        signatureImageSignatory {
          bucket
          region
          key
        }
      }
    }
    driver {
      id
      owner
      name
      carrier
      associationSecret
    }
  }
}
`;
export const onUpdateContract = `subscription OnUpdateContract($owner: String!, $carrierUsername: String!) {
  onUpdateContract(owner: $owner, carrierUsername: $carrierUsername) {
    id
    owner
    carrierUsername
    status
    shipper {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    carrier {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    delivery {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    arrivalDate
    deliveryDate
    pickup {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    loads {
      category
      quantity
      description
    }
    trailer
    truck
    references {
      carrier
    }
    updatedAt
    createdAt
    events {
      author {
        username
      }
      type
      site
      createdAt
      latitude
      longitude
      signature {
        method
        signatureImageDriver {
          bucket
          region
          key
        }
        signatureImageSignatory {
          bucket
          region
          key
        }
      }
    }
    driver {
      id
      owner
      name
      carrier
      associationSecret
    }
  }
}
`;
export const onDeleteContract = `subscription OnDeleteContract($owner: String!) {
  onDeleteContract(owner: $owner) {
    id
    owner
    carrierUsername
    status
    shipper {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    carrier {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    delivery {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    arrivalDate
    deliveryDate
    pickup {
      id
      owner
      name
      postalCode
      address
      city
      country
    }
    loads {
      category
      quantity
      description
    }
    trailer
    truck
    references {
      carrier
    }
    updatedAt
    createdAt
    events {
      author {
        username
      }
      type
      site
      createdAt
      latitude
      longitude
      signature {
        method
        signatureImageDriver {
          bucket
          region
          key
        }
        signatureImageSignatory {
          bucket
          region
          key
        }
      }
    }
    driver {
      id
      owner
      name
      carrier
      associationSecret
    }
  }
}
`;
export const onCreateContact = `subscription OnCreateContact($owner: String!) {
  onCreateContact(owner: $owner) {
    id
    owner
    name
    postalCode
    address
    city
    country
  }
}
`;
export const onUpdateContact = `subscription OnUpdateContact($owner: String!) {
  onUpdateContact(owner: $owner) {
    id
    owner
    name
    postalCode
    address
    city
    country
  }
}
`;
export const onDeleteContact = `subscription OnDeleteContact($owner: String!) {
  onDeleteContact(owner: $owner) {
    id
    owner
    name
    postalCode
    address
    city
    country
  }
}
`;
export const onCreateDriver = `subscription OnCreateDriver($owner: String!) {
  onCreateDriver(owner: $owner) {
    id
    owner
    name
    carrier
    associationSecret
  }
}
`;
export const onDeleteDriver = `subscription OnDeleteDriver($owner: String!) {
  onDeleteDriver(owner: $owner) {
    id
    owner
    name
    carrier
    associationSecret
  }
}
`;
export const onUpdateDriver = `subscription OnUpdateDriver($owner: String!) {
  onUpdateDriver(owner: $owner) {
    id
    owner
    name
    carrier
    associationSecret
  }
}
`;
