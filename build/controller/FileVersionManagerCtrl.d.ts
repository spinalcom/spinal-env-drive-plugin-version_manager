declare const controller: {
    ctrlName: string;
    templateName: string;
    templateUri: string;
    ctrl: (string | (($scope: any, FileVersionManagerService: any) => void))[];
};
export default controller;
