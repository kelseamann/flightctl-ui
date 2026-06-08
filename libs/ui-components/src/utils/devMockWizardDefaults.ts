import { BindingType } from '@flightctl/types/imagebuilder';
import { CatalogItemArtifactType, CatalogItemType } from '@flightctl/types/alpha';

import { AddCatalogItemFormValues } from '../components/Catalog/AddCatalogItemWizard/types';
import {
  getInitialValues as getCatalogInitialValues,
  getEmptyArtifact,
  getEmptyVersion,
} from '../components/Catalog/AddCatalogItemWizard/utils';
import {
  CockpitOnsiteSetupValues,
  defaultCockpitOnsiteSetupValues,
} from '../components/CockpitOnsiteSetup/types';
import { ImageBuildFormValues } from '../components/ImageBuilds/CreateImageBuildWizard/types';
import { getInitialValues as getImageBuildInitialValues } from '../components/ImageBuilds/CreateImageBuildWizard/utils';

export const getDevMockCockpitOnsiteSetupInitialValues = (): CockpitOnsiteSetupValues => ({
  ...defaultCockpitOnsiteSetupValues,
  hostname: 'localhost',
  description: 'Edge node — plant floor rack 2',
  labels: 'site=plant-a\nrole=edge',
  flightControlEndpoint: 'https://flightctl.example.com',
});

export const getDevMockImageBuildInitialValues = (): ImageBuildFormValues => ({
  ...getImageBuildInitialValues(),
  promoteToCatalog: false,
  buildName: 'mock-image-build',
  source: {
    repository: 'oci-registry',
    imageName: 'rhel9/rhel-bootc',
    imageTag: '9.6',
  },
  destination: {
    repository: 'oci-registry',
    imageName: 'flightctl/rhel-bootc',
    imageTag: 'latest',
  },
  bindingType: BindingType.BindingTypeEarly,
  exportFormats: [],
  remoteAccessEnabled: false,
  userConfiguration: {
    username: '',
    publickey: '',
  },
});

export const getDevMockCatalogItemInitialValues = (): AddCatalogItemFormValues => ({
  ...getCatalogInitialValues(),
  catalog: 'demo-catalog',
  name: 'mock-catalog-item',
  displayName: 'Mock Catalog Item',
  shortDescription: 'Sample catalog item for offline UI development',
  type: CatalogItemType.CatalogItemTypeContainer,
  containerUri: 'quay.io/example/mock-catalog-item',
  artifacts: [getEmptyArtifact()],
  versions: [
    {
      ...getEmptyVersion(),
      version: '1.0.0',
      channels: ['testing'],
      references: {
        [CatalogItemArtifactType.CatalogItemArtifactTypeContainer]: 'quay.io/example/mock-catalog-item:1.0.0',
      },
    },
  ],
});
