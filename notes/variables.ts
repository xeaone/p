export const region = process.env.region || 'us-east-1';
export const TableName = process.env.TableName || 'notes';
export const UserPoolId = !process.env.UserPoolId || process.env.UserPoolId === 'UserPool' ? 'us-east-1_TMMgtykjQ' : process.env.UserPoolId;
export const ClientId = !process.env.ClientId || process.env.ClientId === 'UserPoolClient' ? '4morrkq5l7kkfrmvmgrd2873kg' : process.env.ClientId;