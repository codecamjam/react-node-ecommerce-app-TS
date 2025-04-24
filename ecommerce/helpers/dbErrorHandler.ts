export interface CustomError extends Error {
  code?: number;
  errors?: {
    [key: string]: {
      message: string;
    };
  };
}

const uniqueMessage = (error: CustomError) => {
  let output: string;
  try {
    const fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1')
    );
    output = `${fieldName.charAt(0).toUpperCase()} ${fieldName.slice(
      1
    )} already exists`;
  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};
export const errorHandler = (error: CustomError) => {
  let message = '';

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    for (let errorName in error.errors) {
      if (error.errors[errorName].message)
        message = error.errors[errorName].message;
    }
  }

  return message;
};
