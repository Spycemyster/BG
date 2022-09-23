import { RemoteConfigTemplate } from 'firebase-admin/remote-config';
import * as admin from 'firebase-admin';

let templateData: RemoteConfigTemplate;

/**
 * Gets the data field from the default remote config.
 * @param field The name of the field to retrieve.
 * @returns
 */
export async function getConfigField(field: string) {
    templateData = templateData || (await admin.remoteConfig().getTemplate());
    const data = templateData.parameters[field].defaultValue;
    if (data == undefined) throw new Error(`Non-existent config field ${field}`);
    return (data as any).value as string;
}

export function setConfigData(template: RemoteConfigTemplate) {
    console.log('Setting config data');
    templateData = template;
}
