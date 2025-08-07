import React from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CustomForm = ({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  sx = {},
}) => {
  const handleFieldChange = (fieldName, value) => {
    onChange({
      target: {
        name: fieldName,
        value: value,
      },
    });
  };

  const renderField = (field) => {
    const { name, type, label, required, options, multiline, rows, ...otherProps } = field;
    const value = values[name] || '';
    const error = errors[name];

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            key={name}
            name={name}
            type={type}
            label={label}
            value={value}
            onChange={(e) => handleFieldChange(name, e.target.value)}
            error={!!error}
            helperText={error}
            required={required}
            fullWidth
            multiline={multiline}
            rows={rows}
            {...otherProps}
          />
        );

      case 'select':
        return (
          <FormControl key={name} fullWidth error={!!error} required={required}>
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              label={label}
              {...otherProps}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl key={name} fullWidth error={!!error} required={required}>
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              multiple
              value={value || []}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              input={<OutlinedInput label={label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              {...otherProps}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'date':
        return (
          <LocalizationProvider key={name} dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={value ? new Date(value) : null}
              onChange={(newValue) => handleFieldChange(name, newValue?.toISOString())}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!error}
                  helperText={error}
                  required={required}
                />
              )}
              {...otherProps}
            />
          </LocalizationProvider>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                name={name}
                checked={value || false}
                onChange={(e) => handleFieldChange(name, e.target.checked)}
                {...otherProps}
              />
            }
            label={label}
          />
        );

      case 'radio':
        return (
          <FormControl key={name} component="fieldset" error={!!error} required={required}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              name={name}
              value={value}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              row={otherProps.row}
            >
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={sx}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={field.gridSize || 12} key={field.name}>
            {renderField(field)}
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Submitting...' : submitText}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomForm; 