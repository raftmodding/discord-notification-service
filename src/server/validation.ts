import { string, object, boolean } from 'yup';
import { ModVersion } from '../entities/ModVersion';

const modVersionSchema = object().shape({
  modTitle: string().required(),
  modDescription: string().required(),
  modBannerUrl: string().url().required(),
  modIconUrl: string().url().required(),
  modUrl: string().url().required(),
  modAuthorName: string().required(),
  modAuthorUrl: string().url().required(),
  version: string().required(),
  changelog: string().required(),
  initial: boolean().required(),
});

/**
 * Validates an input object as a mod version.
 * @param input the input to validate.
 * @returns the mod version - if it could be validated.
 * @throws ValidationError - if the input is invalid.
 */
export async function validateModVersion(input: object): Promise<ModVersion> {
  return await modVersionSchema.validate(input, {
      stripUnknown: true,
  }) as ModVersion;
}