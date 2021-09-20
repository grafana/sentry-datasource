package plugin

import "errors"

var (
	ErrorQueryDataNotImplemented        = errors.New("query data not implemented")
	ErrorCallResourceNotImplemented     = errors.New("call resource not implemented yet")
	ErrorHealthCheckNotImplemented      = errors.New("healthcheck not implemented yet")
	ErrorGetSettingsNotImplemented      = errors.New("get settings not implemented yet")
	ErrorValidateSettingsNotImplemented = errors.New("validate settings not implemented yet")
)
