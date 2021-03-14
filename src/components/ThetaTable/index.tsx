import React, { forwardRef } from 'react'
import MaterialTable from 'material-table';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';

import ViewColumn from '@material-ui/icons/ViewColumn';
import { SvgIconProps } from '@material-ui/core';

const ThetaTable = () => {
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Author', field: 'authors' },
    { title: 'Page Count', field: 'num_pages' },
    { title: 'Rating', field: 'rating' }
  ]
  const data = [
    {
      id: 1,
      title: 'The Hunger Games',
      authors: 'Suzanne Collins',
      num_pages: 374,
      rating: 4.33
    },
    {
      id: 2,
      title: 'Harry Potter and the Order of the Phoenix',
      authors: 'J.K. Rowling',
      num_pages: 870,
      rating: 4.48
    },
    {
      id: 3,
      title: 'To Kill a Mockingbird',
      authors: 'Harper Lee',
      num_pages: 324,
      rating: 4.27
    },
    {
      id: 4,
      title: 'Pride and Prejudice',
      authors: 'Jane Austen',
      num_pages: 279,
      rating: 4.25
    },
    {
      id: 5,
      title: 'Twilight',
      authors: 'Stephenie Meyer',
      num_pages: 498,
      rating: 3.58
    },
    {
      id: 6,
      title: 'The Book Thief',
      authors: 'Markus Zusak',
      num_pages: 552,
      rating: 4.36
    }
  ]
  const tableIcons = {
    Add: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <AddBox {...props} ref={ref} />
    )),
    Check: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Check {...props} ref={ref} />
    )),
    Clear: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Clear {...props} ref={ref} />
    )),
    Delete: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <DeleteOutline {...props} ref={ref} />
    )),
    DetailPanel: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <ChevronRight {...props} ref={ref} />
    )),
    Edit: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Edit {...props} ref={ref} />
    )),
    Export: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <SaveAlt {...props} ref={ref} />
    )),
    Filter: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <FilterList {...props} ref={ref} />
    )),
    FirstPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <FirstPage {...props} ref={ref} />
    )),
    LastPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <LastPage {...props} ref={ref} />
    )),
    NextPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <ChevronRight {...props} ref={ref} />
    )),
    PreviousPage: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Clear {...props} ref={ref} />
    )),
    Search: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Search {...props} ref={ref} />
    )),
    SortArrow: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <ArrowDownward {...props} ref={ref} />
    )),
    ThirdStateCheck: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <Remove {...props} ref={ref} />
    )),
    ViewColumn: forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
      <ViewColumn {...props} ref={ref} />
    )),
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <MaterialTable 
        columns={columns} 
        data={data} 
        title='Theta Table'
        icons={tableIcons}
      />
    </div>
  )
}

export default ThetaTable