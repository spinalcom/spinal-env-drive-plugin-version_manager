declare const controller: {
    ctrlName: string;
    templateName: string;
    templateUri: string;
    ctrl: (string | (($scope: any, fileVersionManagerService: any, $mdDialog: any) => void))[];
};
export default controller;
