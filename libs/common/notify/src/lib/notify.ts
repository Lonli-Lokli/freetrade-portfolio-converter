import { Notyf } from 'notyf';

const notyf = new Notyf();

export const showError = (message: string) => {
  notyf.error({
    message,
  });
};
